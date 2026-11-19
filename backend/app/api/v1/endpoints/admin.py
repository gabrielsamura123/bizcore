from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_superadmin
from app.core.database import get_db
from app.models import Business, User
from app.schemas.admin import (
    AdminBusinessItem,
    BusinessActionResponse,
    PlatformStats,
)

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
    try:
        db.commit()
        db.refresh(business)
    except Exception:
        db.rollback()
        raise

    return BusinessActionResponse(message=message, business=business)


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
