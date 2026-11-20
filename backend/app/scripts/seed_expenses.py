from datetime import date

from sqlalchemy import select

from app.core.database import SessionLocal
from app.models import Business, BusinessMember, Expense, User

DEMO_BUSINESS_NAME = "Lumley Fresh Mart"

DEMO_EXPENSES = [
    {
        "description": "Fuel for generator (Evening shift)",
        "category": "Generator & Fuel",
        "amount": 120.00,
    },
    {
        "description": "Shop cleaning supplies & bags",
        "category": "General Supplies",
        "amount": 45.00,
    },
    {
        "description": "Kekeh delivery fee for stock pickup",
        "category": "Transport & Delivery",
        "amount": 30.00,
    },
]


def seed_expenses() -> None:
    db = SessionLocal()
    try:
        business = db.execute(
            select(Business).where(Business.name == DEMO_BUSINESS_NAME)
        ).scalar_one_or_none()
        if business is None:
            return

        owner = db.execute(
            select(User)
            .join(BusinessMember, BusinessMember.user_id == User.id)
            .where(
                BusinessMember.business_id == business.id,
                BusinessMember.role == "owner",
            )
        ).scalars().first()
        if owner is None:
            return

        created = 0
        for item in DEMO_EXPENSES:
            existing = db.execute(
                select(Expense.id).where(
                    Expense.business_id == business.id,
                    Expense.description == item["description"],
                )
            ).scalar_one_or_none()
            if existing is not None:
                continue

            db.add(
                Expense(
                    business_id=business.id,
                    user_id=owner.id,
                    category=item["category"],
                    amount=item["amount"],
                    description=item["description"],
                    date=date.today(),
                )
            )
            created += 1

        db.commit()
        print(f"Expense seed complete: created={created}")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_expenses()
