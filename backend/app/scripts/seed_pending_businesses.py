import re

from sqlalchemy import func, select

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models import Business, BusinessMember, Product, User
from app.scripts.seed_demo_data import DEMO_ACCOUNT_CREATED_AT
from app.scripts.seed_features import ensure_business_features
from app.scripts.seed_products import DEMO_PRODUCTS

OWNER_PASSWORD = "Owner123!"
STAFF_PASSWORD = "Staff123!"

FIRST_NAMES = [
    "Aminata",
    "Ibrahim",
    "Fatmata",
    "Mohamed",
    "Zainab",
    "Alhaji",
    "Hawa",
    "Sadio",
    "Mariam",
    "Kofi",
    "Adama",
    "Musa",
    "Neneh",
    "Abu",
    "Salamatu",
    "Tamba",
    "Isata",
    "Lamin",
    "Bintu",
    "Sorie",
]

LAST_NAMES = [
    "Kamara",
    "Bangura",
    "Conteh",
    "Sesay",
    "Koroma",
    "Fofanah",
    "Jalloh",
    "Kargbo",
    "Turay",
    "Mansaray",
    "Forna",
    "Daboh",
    "Wurie",
    "Caulker",
    "Kallon",
    "Yayah",
    "Swarray",
    "Bockarie",
    "Momoh",
    "Samba",
]

PENDING_BUSINESSES = [
    {
        "name": "Freetown Central Supermarket",
        "industry": "Supermarket",
        "domain": "freetowncentral.sl",
        "phone": "+232 76 100 001",
        "address": "Freetown, Western Area",
        "owner_name": "Aminata Kamara",
    },
    {
        "name": "Kenema Community Pharmacy",
        "industry": "Pharmacy",
        "domain": "kenemapharma.sl",
        "phone": "+232 76 100 002",
        "address": "Kenema, Eastern Province",
        "owner_name": "Mohamed Bangura",
    },
    {
        "name": "Makeni Build Mart",
        "industry": "General Retail",
        "domain": "makenibuild.sl",
        "phone": "+232 76 100 003",
        "address": "Makeni, Northern Province",
        "owner_name": "Ibrahim Koroma",
    },
    {
        "name": "Bo Fashion Gallery",
        "industry": "Boutique",
        "domain": "bofashion.sl",
        "phone": "+232 76 100 004",
        "address": "Bo, Southern Province",
        "owner_name": "Fatmata Conteh",
    },
    {
        "name": "Kono Gold Electronics",
        "industry": "Electronics",
        "domain": "konoelectronic.sl",
        "phone": "+232 76 100 005",
        "address": "Koidu, Kono District",
        "owner_name": "Alhaji Sesay",
    },
    {
        "name": "Port Loko Fresh Produce",
        "industry": "General Retail",
        "domain": "portlokofresh.sl",
        "phone": "+232 76 100 006",
        "address": "Port Loko, Northern Province",
        "owner_name": "Zainab Fofanah",
    },
    {
        "name": "Bombali Medical Supplies",
        "industry": "Pharmacy",
        "domain": "bombalimed.sl",
        "phone": "+232 76 100 007",
        "address": "Makeni, Bombali District",
        "owner_name": "Hawa Jalloh",
    },
    {
        "name": "Western Area Kitchen",
        "industry": "Restaurant",
        "domain": "westernkitchen.sl",
        "phone": "+232 76 100 008",
        "address": "Hastings, Western Area",
        "owner_name": "Sadio Kargbo",
    },
    {
        "name": "Kailahun Agro Store",
        "industry": "General Retail",
        "domain": "kailahunagro.sl",
        "phone": "+232 76 100 009",
        "address": "Kailahun, Eastern Province",
        "owner_name": "Mariam Turay",
    },
    {
        "name": "Moyamba City Mart",
        "industry": "Supermarket",
        "domain": "moyambamart.sl",
        "phone": "+232 76 100 010",
        "address": "Moyamba, Southern Province",
        "owner_name": "Kofi Mansaray",
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


def ensure_user(db, email: str, full_name: str, password: str) -> User:
    user = db.execute(select(User).where(User.email == email)).scalar_one_or_none()

    if user is None:
        user = User(
            email=email,
            full_name=full_name,
            hashed_password=hash_password(password),
            is_active=True,
            is_superadmin=False,
            created_at=DEMO_ACCOUNT_CREATED_AT,
        )
        db.add(user)
        db.flush()

    return user


def ensure_membership(db, business_id: int, user_id: int, role: str) -> None:
    membership = db.execute(
        select(BusinessMember).where(
            BusinessMember.business_id == business_id,
            BusinessMember.user_id == user_id,
        )
    ).scalar_one_or_none()

    if membership is None:
        db.add(
            BusinessMember(
                business_id=business_id,
                user_id=user_id,
                role=role,
            )
        )
    else:
        membership.role = role


def staff_role(position: int) -> str:
    if position == 1:
        return "manager"
    if position in (8, 9):
        return "inventory"
    return "cashier"


def seed_pending_businesses() -> None:
    db = SessionLocal()
    businesses_created = 0
    users_created = 0
    products_created = 0

    try:
        existing_users = set(db.execute(select(User.email)).scalars().all())

        for business_index, item in enumerate(PENDING_BUSINESSES):
            owner_email = f"owner@{item['domain']}"
            owner = ensure_user(
                db, owner_email, item["owner_name"], OWNER_PASSWORD
            )
            if owner_email not in existing_users:
                users_created += 1

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
                    status="pending",
                    owner_id=owner.id,
                )
                db.add(business)
                db.flush()
                businesses_created += 1
            else:
                business.industry = item["industry"]
                business.phone = item["phone"]
                business.address = item["address"]
                business.owner_id = owner.id

            ensure_membership(db, business.id, owner.id, "owner")
            ensure_business_features(db, business)

            for position in range(1, 11):
                email = f"staff{position:02d}@{item['domain']}"
                name_index = business_index * 10 + position - 1
                full_name = (
                    f"{FIRST_NAMES[name_index % len(FIRST_NAMES)]} "
                    f"{LAST_NAMES[name_index % len(LAST_NAMES)]}"
                )
                employee = ensure_user(db, email, full_name, STAFF_PASSWORD)
                if email not in existing_users:
                    users_created += 1

                ensure_membership(
                    db, business.id, employee.id, staff_role(position)
                )

            for product in DEMO_PRODUCTS:
                existing = db.execute(
                    select(Product.id).where(
                        Product.business_id == business.id,
                        Product.sku == product["sku"],
                    )
                ).scalar_one_or_none()
                if existing is not None:
                    continue

                db.add(
                    Product(
                        business_id=business.id,
                        low_stock_threshold=5,
                        is_active=True,
                        **product,
                    )
                )
                products_created += 1

        db.commit()

        total_businesses = db.execute(
            select(func.count()).select_from(Business)
        ).scalar_one()
        pending = db.execute(
            select(func.count())
            .select_from(Business)
            .where(Business.status == "pending")
        ).scalar_one()
        total_users = db.execute(
            select(func.count()).select_from(User)
        ).scalar_one()
        total_memberships = db.execute(
            select(func.count()).select_from(BusinessMember)
        ).scalar_one()

        print("Pending business seed complete")
        print(
            f"created_businesses={businesses_created} "
            f"created_users={users_created} created_products={products_created}"
        )
        print(
            f"businesses={total_businesses} pending={pending} "
            f"users={total_users} memberships={total_memberships}"
        )
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_pending_businesses()
