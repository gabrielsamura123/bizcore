from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_superadmin
from app.core.database import get_db
from app.models import Business, BusinessFeature, Feature, User
from app.schemas.admin import (
    AdminBusinessItem,
    BusinessActionResponse,
    PlatformStats,
)
from app.schemas.feature import (
    BusinessFeatureItem,
    FeatureItem,
    FeatureToggleRequest,
    FeatureToggleResponse,
)
from app.scripts.seed_features import ensure_business_features

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(get_current_active_superadmin)],
)

ALLOWED_STATUS_FILTERS = {"pending", "active", "suspended", "rejected"}


@router.get("/stats", response_model=PlatformStats)
def platform_stats(db: Session = Depends(get_db)):
    def count(model, column=None, value=None):
        query = select(func.count()).select_from(model)
        if column is not None:
            query = query.where(column == value)
        return db.execute(query).scalar_one()

    return PlatformStats(
        total_businesses=count(Business),
        pending_businesses=count(Business, Business.status, "pending"),
        active_businesses=count(Business, Business.status, "active"),
        suspended_businesses=count(Business, Business.status, "suspended"),
        total_users=count(User),
    )


@router.get("/businesses", response_model=list[AdminBusinessItem])
def list_platform_businesses(
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
):
    query = select(Business, User).join(User, Business.owner_id == User.id)

    if status_filter:
        normalized = status_filter.lower()
        if normalized not in ALLOWED_STATUS_FILTERS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid business status filter",
            )
        query = query.where(Business.status == normalized)

    rows = db.execute(query.order_by(Business.created_at.desc())).all()

    return [
        AdminBusinessItem(
            id=business.id,
            name=business.name,
            slug=business.slug,
            industry=business.industry,
            currency=business.currency,
            phone=business.phone,
            address=business.address,
            status=business.status,
            created_at=business.created_at,
            owner_name=owner.full_name,
            owner_email=owner.email,
        )
        for business, owner in rows
    ]


@router.get("/features", response_model=list[FeatureItem])
def list_system_features(db: Session = Depends(get_db)):
    return db.execute(
        select(Feature).order_by(Feature.category, Feature.name)
    ).scalars().all()


def _get_business_or_404(db: Session, business_id: int) -> Business:
    business = db.execute(
        select(Business).where(Business.id == business_id)
    ).scalar_one_or_none()
    if business is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found",
        )
    return business


@router.get(
    "/businesses/{business_id}/features", response_model=list[BusinessFeatureItem]
)
def list_business_features(business_id: int, db: Session = Depends(get_db)):
    business = _get_business_or_404(db, business_id)
    ensure_business_features(db, business)

    features = db.execute(
        select(Feature).order_by(Feature.category, Feature.name)
    ).scalars().all()
    rows = db.execute(
        select(BusinessFeature).where(BusinessFeature.business_id == business_id)
    ).scalars().all()
    enabled_by_feature_id = {row.feature_id: row.is_enabled for row in rows}

    return [
        BusinessFeatureItem(
            id=feature.id,
            key=feature.key,
            name=feature.name,
            description=feature.description,
            category=feature.category,
            is_core=feature.is_core,
            is_enabled=enabled_by_feature_id.get(feature.id, feature.is_core),
        )
        for feature in features
    ]


@router.post(
    "/businesses/{business_id}/features/toggle",
    response_model=FeatureToggleResponse,
)
def toggle_business_feature(
    business_id: int,
    payload: FeatureToggleRequest,
    db: Session = Depends(get_db),
):
    business = _get_business_or_404(db, business_id)

    feature = db.execute(
        select(Feature).where(Feature.key == payload.feature_key)
    ).scalar_one_or_none()
    if feature is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Feature not found",
        )

    if feature.is_core and not payload.is_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Core features cannot be disabled",
        )

    row = db.execute(
        select(BusinessFeature).where(
            BusinessFeature.business_id == business_id,
            BusinessFeature.feature_id == feature.id,
        )
    ).scalar_one_or_none()

    if row is None:
        row = BusinessFeature(
            business_id=business_id,
            feature_id=feature.id,
            is_enabled=payload.is_enabled,
        )
        db.add(row)
    else:
        row.is_enabled = payload.is_enabled

    try:
        db.commit()
        db.refresh(row)
    except Exception:
        db.rollback()
        raise

    return FeatureToggleResponse(
        feature_key=feature.key,
        is_enabled=row.is_enabled,
        message=f"Feature {feature.name} updated",
    )


def _change_business_status(
    db: Session,
    business_id: int,
    new_status: str,
    message: str,
) -> BusinessActionResponse:
    business = db.execute(
        select(Business).where(Business.id == business_id)
    ).scalar_one_or_none()

    if business is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found",
        )

    business.status = new_status
    if new_status == "active":
        ensure_business_features(db, business)

    try:
        db.commit()
        db.refresh(business)
    except Exception:
        db.rollback()
        raise

    return BusinessActionResponse(message=message, business=business)


@router.post(
    "/businesses/bulk-approve", response_model=list[BusinessActionResponse]
)
def bulk_approve_businesses(
    business_ids: list[int], db: Session = Depends(get_db)
):
    return [
        _change_business_status(
            db, business_id, "active", "Business workspace approved"
        )
        for business_id in business_ids
    ]


@router.patch(
    "/businesses/{business_id}/approve", response_model=BusinessActionResponse
)
def approve_business(business_id: int, db: Session = Depends(get_db)):
    return _change_business_status(
        db, business_id, "active", "Business workspace approved"
    )


@router.patch(
    "/businesses/{business_id}/reject", response_model=BusinessActionResponse
)
def reject_business(business_id: int, db: Session = Depends(get_db)):
    return _change_business_status(
        db, business_id, "rejected", "Business workspace rejected"
    )


@router.patch(
    "/businesses/{business_id}/suspend", response_model=BusinessActionResponse
)
def suspend_business(business_id: int, db: Session = Depends(get_db)):
    return _change_business_status(
        db, business_id, "suspended", "Business workspace suspended"
    )


@router.patch(
    "/businesses/{business_id}/reactivate", response_model=BusinessActionResponse
)
def reactivate_business(business_id: int, db: Session = Depends(get_db)):
    return _change_business_status(
        db, business_id, "active", "Business workspace reactivated"
    )
