import re

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import require_business_roles
from app.core.database import get_db
from app.models import CustomField
from app.schemas.custom_field import CustomFieldCreate, CustomFieldResponse

router = APIRouter(
    prefix="/businesses/{business_id}/custom-fields",
    tags=["custom-fields"],
)

WORKSPACE_ROLES = ["owner", "manager", "cashier", "inventory"]


def slugify_field(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "_", value.lower()).strip("_")
    return slug or "custom_field"


@router.get("", response_model=list[CustomFieldResponse])
@router.get("/", response_model=list[CustomFieldResponse])
def list_custom_fields(
    access=Depends(require_business_roles(WORKSPACE_ROLES)),
    db: Session = Depends(get_db),
):
    return db.execute(
        select(CustomField)
        .where(
            CustomField.business_id == access.business.id,
            CustomField.entity_type == "product",
        )
        .order_by(CustomField.field_label)
    ).scalars().all()


@router.post("", response_model=CustomFieldResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=CustomFieldResponse, status_code=status.HTTP_201_CREATED)
def create_custom_field(
    payload: CustomFieldCreate,
    access=Depends(require_business_roles(["owner", "manager"])),
    db: Session = Depends(get_db),
):
    field_label = payload.field_label.strip()
    field_name = slugify_field(payload.field_name or field_label)

    existing = db.execute(
        select(CustomField.id).where(
            CustomField.business_id == access.business.id,
            CustomField.entity_type == "product",
            CustomField.field_name == field_name,
        )
    ).scalar_one_or_none()
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Custom field already exists",
        )

    field = CustomField(
        business_id=access.business.id,
        entity_type="product",
        field_name=field_name,
        field_label=field_label,
        field_type=payload.field_type,
        is_required=payload.is_required,
    )
    db.add(field)
    db.commit()
    db.refresh(field)
    return field


@router.delete("/{field_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_custom_field(
    field_id: int,
    access=Depends(require_business_roles(["owner"])),
    db: Session = Depends(get_db),
):
    field = db.execute(
        select(CustomField).where(
            CustomField.id == field_id,
            CustomField.business_id == access.business.id,
            CustomField.entity_type == "product",
        )
    ).scalar_one_or_none()
    if field is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Custom field not found",
        )

    db.delete(field)
    db.commit()
