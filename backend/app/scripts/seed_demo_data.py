import re
from datetime import datetime, timezone

from sqlalchemy import func, select

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models import Business, BusinessMember, User

DEMO_PASSWORD = "DemoPass123!"
DEMO_EMPLOYEE_PASSWORD = "pass123"
DEMO_ACCOUNT_CREATED_AT = datetime(2024, 1, 15, 9, 0, tzinfo=timezone.utc)

OWNERS = [
    {
        "email": "kadie@lumleyfresh.sl",
        "full_name": "Kadie Sesay",
    },
    {
        "email": "mbangura@bopharm.sl",
        "full_name": "Dr. Mohamed Bangura",
    },
    {
        "email": "koroma@kissyelec.sl",
        "full_name": "Ibrahim Koroma",
    },
    {
        "email": "fatmata@makenihub.sl",
        "full_name": "Fatmata Kamara",
    },
]

BUSINESSES = [
    {
        "name": "Lumley Fresh Mart",
        "industry": "Supermarket",
        "status": "active",
        "owner_email": "kadie@lumleyfresh.sl",
        "phone": "+232 76 220 111",
        "address": "Freetown",
    },
    {
        "name": "Bo Central Pharmacy",
        "industry": "Pharmacy",
        "status": "active",
        "owner_email": "mbangura@bopharm.sl",
        "phone": "+232 30 445 882",
        "address": "Bo",
    },
    {
        "name": "Kissy Road Electronics",
        "industry": "Electronics",
        "status": "active",
        "owner_email": "koroma@kissyelec.sl",
        "phone": "+232 78 991 002",
        "address": "Freetown",
    },
    {
        "name": "Makeni Fashion Hub",
        "industry": "Boutique",
        "status": "suspended",
        "owner_email": "fatmata@makenihub.sl",
        "phone": "+232 77 334 119",
        "address": "Makeni",
    },
]

EMPLOYEES = [
    {
        "email": "cashier@lumleyfresh.sl",
        "full_name": "Alhaji Bangura",
        "role": "cashier",
        "business_name": "Lumley Fresh Mart",
    },
    {
        "email": "manager@bopharm.sl",
        "full_name": "Aminata Conteh",
        "role": "manager",
        "business_name": "Bo Central Pharmacy",
    },
]


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "business"


def unique_slug(db, name: str, exclude_id=None) -> str:
    base = slugify(name)
    candidate = base
    suffix = 2

    while True:
        query = select(Business.id).where(Business.slug == candidate)
        if exclude_id is not None:
            query = query.where(Business.id != exclude_id)
        if db.execute(query).scalar_one_or_none() is None:
            return candidate
        candidate = f"{base}-{suffix}"
        suffix += 1


def seed() -> None:
    db = SessionLocal()
    try:
        owners_by_email = {}
        businesses_by_name = {}

        for item in OWNERS:
            owner = db.execute(
                select(User).where(User.email == item["email"])
            ).scalar_one_or_none()

            if owner is None:
                owner = User(
                    email=item["email"],
                    full_name=item["full_name"],
                    hashed_password=hash_password(DEMO_PASSWORD),
                    is_active=True,
                    is_superadmin=False,
                    created_at=DEMO_ACCOUNT_CREATED_AT,
                )
                db.add(owner)
                db.flush()
            else:
                owner.full_name = item["full_name"]
                owner.is_active = True
                owner.is_superadmin = False
                owner.created_at = DEMO_ACCOUNT_CREATED_AT

            owners_by_email[item["email"]] = owner

        for item in BUSINESSES:
            owner = owners_by_email[item["owner_email"]]
            business = db.execute(
                select(Business).where(Business.name == item["name"])
            ).scalar_one_or_none()

            if business is None:
                business = Business(
                    name=item["name"],
                    slug=unique_slug(db, item["name"]),
                    industry=item["industry"],
                    currency="NLe",
                    phone=item["phone"],
                    address=item["address"],
                    status=item["status"],
                    owner_id=owner.id,
                )
                db.add(business)
                db.flush()
            else:
                business.industry = item["industry"]
                business.phone = item["phone"]
                business.address = item["address"]
                business.status = item["status"]
                business.owner_id = owner.id
                business.slug = unique_slug(db, item["name"], business.id)

            membership = db.execute(
                select(BusinessMember).where(
                    BusinessMember.business_id == business.id,
                    BusinessMember.user_id == owner.id,
                )
            ).scalar_one_or_none()

            if membership is None:
                db.add(
                    BusinessMember(
                        business_id=business.id,
                        user_id=owner.id,
                        role="owner",
                    )
                )
            else:
                membership.role = "owner"

            businesses_by_name[item["name"]] = business

        for item in EMPLOYEES:
            business = businesses_by_name[item["business_name"]]
            employee = db.execute(
                select(User).where(User.email == item["email"])
            ).scalar_one_or_none()

            if employee is None:
                employee = User(
                    email=item["email"],
                    full_name=item["full_name"],
                    hashed_password=hash_password(DEMO_EMPLOYEE_PASSWORD),
                    is_active=True,
                    is_superadmin=False,
                    created_at=DEMO_ACCOUNT_CREATED_AT,
                )
                db.add(employee)
                db.flush()
            else:
                employee.full_name = item["full_name"]
                employee.is_active = True
                employee.is_superadmin = False
                employee.created_at = DEMO_ACCOUNT_CREATED_AT

            membership = db.execute(
                select(BusinessMember).where(
                    BusinessMember.business_id == business.id,
                    BusinessMember.user_id == employee.id,
                )
            ).scalar_one_or_none()

            if membership is None:
                db.add(
                    BusinessMember(
                        business_id=business.id,
                        user_id=employee.id,
                        role=item["role"],
                    )
                )
            else:
                membership.role = item["role"]

        db.commit()

        total_businesses = db.execute(select(func.count()).select_from(Business)).scalar_one()
        pending = db.execute(
            select(func.count()).select_from(Business).where(Business.status == "pending")
        ).scalar_one()
        active = db.execute(
            select(func.count()).select_from(Business).where(Business.status == "active")
        ).scalar_one()
        suspended = db.execute(
            select(func.count()).select_from(Business).where(Business.status == "suspended")
        ).scalar_one()
        total_users = db.execute(select(func.count()).select_from(User)).scalar_one()

        print("Demo seed complete")
        print(f"businesses={total_businesses} pending={pending} active={active} suspended={suspended} users={total_users}")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
