from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models import Business, BusinessFeature, Feature

STANDARD_FEATURES = [
    {
        "key": "pos_core",
        "name": "Point of Sale",
        "description": "Fast counter sales, receipts, and returns.",
        "category": "Sales",
        "is_core": True,
    },
    {
        "key": "inventory_basic",
        "name": "Inventory & Stock Tracking",
        "description": "Stock levels, suppliers, and low-stock alerts.",
        "category": "Inventory",
        "is_core": True,
    },
    {
        "key": "barcode_scanner",
        "name": "Barcode & SKU Scanner",
        "description": "Scan SKUs and barcodes for quick stock and checkout updates.",
        "category": "Inventory",
        "is_core": False,
    },
    {
        "key": "expiry_dates",
        "name": "Medicine & Perishable Expiry Tracking",
        "description": "Track expiry dates and get alerts before stock expires.",
        "category": "Specialized",
        "is_core": False,
    },
    {
        "key": "expenses",
        "name": "Expense & Cash Flow Manager",
        "description": "Record operating expenses and monitor cash flow.",
        "category": "Finance",
        "is_core": False,
    },
    {
        "key": "tables_dining",
        "name": "Table & Dine-In Management",
        "description": "Manage dining tables, sections, and dine-in orders.",
        "category": "Specialized",
        "is_core": False,
    },
]

INDUSTRY_DEFAULT_KEYS = {
    "Supermarket": [
        "pos_core",
        "inventory_basic",
        "barcode_scanner",
        "expenses",
    ],
    "Pharmacy": [
        "pos_core",
        "inventory_basic",
        "expiry_dates",
        "barcode_scanner",
        "expenses",
    ],
    "Boutique": [
        "pos_core",
        "inventory_basic",
        "barcode_scanner",
        "expenses",
    ],
    "Restaurant": ["pos_core", "tables_dining", "expenses"],
    "Electronics": [
        "pos_core",
        "inventory_basic",
        "barcode_scanner",
        "expenses",
    ],
    "General Retail": ["pos_core", "inventory_basic", "expenses"],
}

DEFAULT_INDUSTRY = "General Retail"


def seed_standard_features(db: Session) -> dict[str, Feature]:
    features: dict[str, Feature] = {}

    for payload in STANDARD_FEATURES:
        feature = db.execute(
            select(Feature).where(Feature.key == payload["key"])
        ).scalar_one_or_none()

        if feature is None:
            feature = Feature(**payload)
            db.add(feature)
            db.flush()
        else:
            for field, value in payload.items():
                setattr(feature, field, value)

        features[payload["key"]] = feature

    db.flush()
    return features


def ensure_business_features(
    db: Session,
    business: Business,
    features: dict[str, Feature] | None = None,
) -> None:
    feature_map = features
    if feature_map is None:
        feature_map = {
            feature.key: feature
            for feature in db.execute(select(Feature)).scalars().all()
        }

    keys = list(
        dict.fromkeys(
            [
                *[
                    feature.key
                    for feature in feature_map.values()
                    if feature.is_core
                ],
                *INDUSTRY_DEFAULT_KEYS.get(
                    business.industry, INDUSTRY_DEFAULT_KEYS[DEFAULT_INDUSTRY]
                ),
            ]
        )
    )

    for key in keys:
        feature = feature_map.get(key)
        if feature is None:
            continue

        row = db.execute(
            select(BusinessFeature).where(
                BusinessFeature.business_id == business.id,
                BusinessFeature.feature_id == feature.id,
            )
        ).scalar_one_or_none()

        if row is None:
            db.add(
                BusinessFeature(
                    business_id=business.id,
                    feature_id=feature.id,
                    is_enabled=True,
                )
            )
        elif feature.is_core and not row.is_enabled:
            row.is_enabled = True

    db.flush()


def seed_features() -> None:
    db = SessionLocal()
    try:
        features = seed_standard_features(db)
        businesses = db.execute(select(Business)).scalars().all()

        for business in businesses:
            ensure_business_features(db, business, features)

        db.commit()
        print(
            f"Feature seed complete: features={len(features)} businesses={len(businesses)}"
        )
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_features()
