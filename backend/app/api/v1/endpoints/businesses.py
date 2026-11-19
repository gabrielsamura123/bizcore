import re
import secrets
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_business, get_current_user
from app.core.database import get_db
from app.models import Business, BusinessMember, User
from app.schemas.business import (
    BusinessCreate,
    BusinessResponse,
    BusinessUpdate,
    MyBusinessItem,
)

router = APIRouter(prefix="/businesses", tags=["businesses"])


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "business"


def _unique_slug(db: Session, name: str, exclude_id: Optional[int] = None) -> str:
    base = _slugify(name)
    candidate = base

    while True:
        query = select(Business.id).where(Business.slug == candidate)
        if exclude_id is not None:
            query = query.where(Business.id != exclude_id)
        if db.execute(query).scalar_one_or_none() is None:
            return candidate
        candidate = f"{base}-{secrets.token_hex(2)}"


@router.post("/", response_model=BusinessResponse, status_code=status.HTTP_201_CREATED)
def create_business(
    payload: BusinessCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    business = Business(
        name=payload.name,
        slug=_unique_slug(db, payload.name),
        industry=payload.industry,
        currency=payload.currency,
        phone=payload.phone,
        address=payload.address,
        status="pending",
        owner_id=current_user.id,
    )

    try:
        db.add(business)
        db.flush()
        db.add(
            BusinessMember(
                business_id=business.id,
                user_id=current_user.id,
                role="owner",
            )
        )
        db.commit()
        db.refresh(business)
    except Exception:
        db.rollback()
        raise

    return business


@router.get("/my", response_model=list[MyBusinessItem])
def list_my_businesses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = db.execute(
        select(Business, BusinessMember.role)
        .join(BusinessMember, BusinessMember.business_id == Business.id)
        .where(BusinessMember.user_id == current_user.id)
        .order_by(Business.created_at.desc())
    ).all()

    return [MyBusinessItem(business=business, role=role) for business, role in rows]


@router.get("/{business_id}", response_model=BusinessResponse)
def get_business(business: Business = Depends(get_current_business)):
    return business


@router.put("/{business_id}", response_model=BusinessResponse)
def update_business(
    payload: BusinessUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    business: Business = Depends(get_current_business),
):
    membership = db.execute(
        select(BusinessMember).where(
            BusinessMember.business_id == business.id,
            BusinessMember.user_id == current_user.id,
        )
    ).scalar_one_or_none()

    if membership is None or membership.role not in ("owner", "manager"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only owners and managers can update this business",
        )

    values = payload.model_dump(exclude_unset=True)

    if values.get("name"):
        business.slug = _unique_slug(db, values["name"], exclude_id=business.id)

    for field, value in values.items():
        setattr(business, field, value)

    try:
        db.commit()
        db.refresh(business)
    except Exception:
        db.rollback()
        raise

    return business
