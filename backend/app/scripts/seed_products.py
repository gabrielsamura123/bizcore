from sqlalchemy import select

from app.core.database import SessionLocal
from app.models import Business, Product

DEMO_PRODUCTS = [
    {
        "name": "Royal Rice (25kg Bag)",
        "category": "Food & Grains",
        "price": 480.00,
        "cost_price": 420.00,
        "stock_quantity": 25,
        "sku": "RICE-25KG",
    },
    {
        "name": "Indomie Chicken (Carton)",
        "category": "Groceries",
        "price": 185.00,
        "cost_price": 155.00,
        "stock_quantity": 40,
        "sku": "INDO-40",
    },
    {
        "name": "Peak Powdered Milk (400g)",
        "category": "Dairy",
        "price": 65.00,
        "cost_price": 52.00,
        "stock_quantity": 18,
        "sku": "PEAK-400",
    },
    {
        "name": "Star Beer (Crate 24 btls)",
        "category": "Beverages",
        "price": 320.00,
        "cost_price": 280.00,
        "stock_quantity": 12,
        "sku": "STAR-CRT",
    },
    {
        "name": "Sierra Leone Gari (Bag)",
        "category": "Food & Grains",
        "price": 150.00,
        "cost_price": 120.00,
        "stock_quantity": 30,
        "sku": "GARI-BAG",
    },
    {
        "name": "Pepsodent Toothpaste",
        "category": "Toiletries",
        "price": 25.00,
        "cost_price": 18.00,
        "stock_quantity": 50,
        "sku": "PEPSO-TB",
    },
]

DEMO_BUSINESS_NAME = "Lumley Fresh Mart"


def seed_products() -> None:
    db = SessionLocal()
    try:
        business = db.execute(
            select(Business).where(Business.name == DEMO_BUSINESS_NAME)
        ).scalar_one_or_none()
        if business is None:
            return

        created = 0
        for item in DEMO_PRODUCTS:
            existing = db.execute(
                select(Product.id).where(
                    Product.business_id == business.id,
                    Product.sku == item["sku"],
                )
            ).scalar_one_or_none()
            if existing is not None:
                continue

            db.add(
                Product(
                    business_id=business.id,
                    low_stock_threshold=5,
                    is_active=True,
                    **item,
                )
            )
            created += 1

        db.commit()
        print(f"Product seed complete: created={created}")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_products()
