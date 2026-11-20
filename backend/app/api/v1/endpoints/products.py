from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import BusinessAccess, require_business_roles
from app.core.database import get_db
from app.models import Product
from app.schemas.product import (
    ProductCreate,
    ProductResponse,
    ProductUpdate,
)

router = APIRouter(
    prefix="/businesses/{business_id}/products",
    tags=["products"],
)


def _get_product(db: Session, business_id: int, product_id: int) -> Product:
    product = db.execute(
        select(Product).where(
            Product.id == product_id,
            Product.business_id == business_id,
            Product.is_active.is_(True),
        )
    ).scalar_one_or_none()
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    return product


@router.get("", response_model=list[ProductResponse])
@router.get("/", response_model=list[ProductResponse])
def list_products(
    search: Optional[str] = Query(default=None),
    access: BusinessAccess = Depends(
        require_business_roles(["owner", "manager", "cashier", "inventory"])
    ),
    db: Session = Depends(get_db),
):
    query = select(Product).where(
        Product.business_id == access.business.id,
        Product.is_active.is_(True),
    )

    if search:
        term = f"%{search.strip()}%"
        query = query.where(
            (Product.name.ilike(term)) | (Product.sku.ilike(term))
        )

    return db.execute(query.order_by(Product.category, Product.name)).scalars().all()


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    payload: ProductCreate,
    access: BusinessAccess = Depends(require_business_roles(["owner", "manager"])),
    db: Session = Depends(get_db),
):
    product = Product(business_id=access.business.id, **payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    payload: ProductUpdate,
    access: BusinessAccess = Depends(require_business_roles(["owner", "manager"])),
    db: Session = Depends(get_db),
):
    product = _get_product(db, access.business.id, product_id)

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product
