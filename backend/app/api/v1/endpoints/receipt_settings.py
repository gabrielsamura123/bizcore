import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.api.deps import BusinessAccess, require_business_roles
from app.core.database import get_db
from app.models import CustomField, ReceiptSetting
from app.schemas.receipt import ReceiptSettingsResponse, ReceiptSettingsUpdate

router = APIRouter(
    prefix="/businesses/{business_id}/receipt-settings",
    tags=["receipt-settings"],
)

UPLOAD_DIR = Path(__file__).resolve().parents[3] / "static" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_LOGO_TYPES = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
}
MAX_LOGO_BYTES = 2 * 1024 * 1024


def get_or_create_receipt_settings(db: Session, business_id: int) -> ReceiptSetting:
    settings = db.execute(
        select(ReceiptSetting).where(ReceiptSetting.business_id == business_id)
    ).scalar_one_or_none()
    if settings is not None:
        return settings

    settings = ReceiptSetting(business_id=business_id)

    try:
        db.add(settings)
        db.commit()
        db.refresh(settings)
    except IntegrityError:
        db.rollback()
        settings = db.execute(
            select(ReceiptSetting).where(ReceiptSetting.business_id == business_id)
        ).scalar_one()

    return settings


def serialize_settings(settings: ReceiptSetting) -> dict:
    data = ReceiptSettingsResponse.model_validate(settings).model_dump()
    data["logo_url"] = f"/uploads/{settings.logo_path}" if settings.logo_path else None
    return data


def build_receipt_config(
    db: Session,
    business,
    cashier_name: str | None = None,
) -> dict:
    config = serialize_settings(get_or_create_receipt_settings(db, business.id))
    config["business_name"] = business.name
    config["business_industry"] = business.industry
    config["business_address"] = business.address
    config["business_phone"] = business.phone
    config["cashier_name"] = cashier_name
    config["custom_field_labels"] = {
        field.field_name: field.field_label
        for field in db.execute(
            select(CustomField).where(
                CustomField.business_id == business.id,
                CustomField.entity_type == "product",
            )
        ).scalars().all()
    }
    return config


@router.get("", response_model=ReceiptSettingsResponse)
@router.get("/", response_model=ReceiptSettingsResponse)
def get_receipt_settings(
    access: BusinessAccess = Depends(
        require_business_roles(["owner", "manager", "cashier", "inventory"])
    ),
    db: Session = Depends(get_db),
):
    return serialize_settings(
        get_or_create_receipt_settings(db, access.business.id)
    )


@router.put("", response_model=ReceiptSettingsResponse)
@router.put("/", response_model=ReceiptSettingsResponse)
def update_receipt_settings(
    payload: ReceiptSettingsUpdate,
    access: BusinessAccess = Depends(require_business_roles(["owner"])),
    db: Session = Depends(get_db),
):
    settings = get_or_create_receipt_settings(db, access.business.id)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(settings, field, value)

    db.commit()
    db.refresh(settings)
    return serialize_settings(settings)


@router.post("/logo", response_model=ReceiptSettingsResponse)
async def upload_receipt_logo(
    file: UploadFile = File(...),
    access: BusinessAccess = Depends(require_business_roles(["owner"])),
    db: Session = Depends(get_db),
):
    extension = ALLOWED_LOGO_TYPES.get(file.content_type)
    if not extension:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Logo must be a PNG, JPEG, or WEBP image",
        )

    content = await file.read()
    if not content:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Logo file is empty",
        )
    if len(content) > MAX_LOGO_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Logo must be 2MB or smaller",
        )

    settings = get_or_create_receipt_settings(db, access.business.id)

    if settings.logo_path:
        old_path = UPLOAD_DIR / settings.logo_path
        if old_path.exists():
            old_path.unlink()

    filename = f"receipt-{access.business.id}-{uuid.uuid4().hex}{extension}"
    (UPLOAD_DIR / filename).write_bytes(content)

    settings.logo_path = filename
    db.commit()
    db.refresh(settings)
    return serialize_settings(settings)


@router.delete("/logo", response_model=ReceiptSettingsResponse)
def delete_receipt_logo(
    access: BusinessAccess = Depends(require_business_roles(["owner"])),
    db: Session = Depends(get_db),
):
    settings = get_or_create_receipt_settings(db, access.business.id)

    if settings.logo_path:
        old_path = UPLOAD_DIR / settings.logo_path
        if old_path.exists():
            old_path.unlink()
        settings.logo_path = None
        db.commit()
        db.refresh(settings)

    return serialize_settings(settings)
