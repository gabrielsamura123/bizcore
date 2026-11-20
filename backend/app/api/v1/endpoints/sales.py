from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import BusinessAccess, require_business_roles
from app.api.v1.endpoints.receipt_settings import build_receipt_config
from app.core.database import get_db
from app.models import Product, Sale, SaleItem, User
from app.schemas.sale import (
    CheckoutRequest,
    ReceiptItem,
    SaleHistoryItem,
    SaleHistoryResponse,
    SaleReceipt,
)

router = APIRouter(
    prefix="/businesses/{business_id}/sales",
    tags=["sales"],
)

ALLOWED_ROLES = ["owner", "manager", "cashier"]


@router.post("/checkout", response_model=SaleReceipt, status_code=status.HTTP_201_CREATED)
def checkout(
    payload: CheckoutRequest,
    access: BusinessAccess = Depends(require_business_roles(ALLOWED_ROLES)),
    db: Session = Depends(get_db),
):
    quantities: dict[int, int] = {}
    for item in payload.items:
        quantities[item.product_id] = quantities.get(item.product_id, 0) + item.quantity

    products = db.execute(
        select(Product)
        .where(
            Product.id.in_(quantities),
            Product.business_id == access.business.id,
            Product.is_active.is_(True),
        )
        .with_for_update()
    ).scalars().all()

    if len(products) != len(quantities):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="One or more products are not available in this workspace",
        )

    product_map = {product.id: product for product in products}
    lines = []
    subtotal = Decimal("0.00")

    for product_id, quantity in quantities.items():
        product = product_map[product_id]
        if product.stock_quantity < quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for {product.name}",
            )

        unit_price = Decimal(str(product.price))
        line_total = unit_price * quantity
        subtotal += line_total
        lines.append((product, quantity, unit_price, line_total))

    total = subtotal
    count = db.execute(
        select(func.count())
        .select_from(Sale)
        .where(Sale.business_id == access.business.id)
    ).scalar_one()
    reference_no = f"REC-{count + 1:04d}"

    cashier = db.execute(
        select(User).where(User.id == access.user_id)
    ).scalar_one()
    receipt_config = build_receipt_config(db, access.business, cashier.full_name)

    sale = Sale(
        business_id=access.business.id,
        cashier_id=cashier.id,
        reference_no=reference_no,
        subtotal=float(subtotal),
        total=float(total),
        payment_method=payload.payment_method,
        customer_phone=payload.customer_phone,
        receipt_snapshot=receipt_config,
        status="completed",
    )
    db.add(sale)
    db.flush()

    receipt_items = []
    for product, quantity, unit_price, line_total in lines:
        db.add(
            SaleItem(
                sale_id=sale.id,
                product_id=product.id,
                quantity=quantity,
                unit_price=float(unit_price),
                subtotal=float(line_total),
                custom_attributes=product.custom_attributes or {},
            )
        )
        product.stock_quantity -= quantity
        receipt_items.append(
            ReceiptItem(
                product_name=product.name,
                quantity=quantity,
                unit_price=float(unit_price),
                subtotal=float(line_total),
                custom_attributes=product.custom_attributes or {},
            )
        )

    try:
        db.commit()
        db.refresh(sale)
    except Exception:
        db.rollback()
        raise

    return SaleReceipt(
        id=sale.id,
        reference_no=sale.reference_no,
        business_name=access.business.name,
        cashier_name=cashier.full_name,
        items=receipt_items,
        subtotal=float(subtotal),
        total=float(total),
        payment_method=sale.payment_method,
        customer_phone=sale.customer_phone,
        created_at=sale.created_at,
        settings=receipt_config,
    )


@router.get("/{sale_id}", response_model=SaleReceipt)
@router.get("/{sale_id}/receipt", response_model=SaleReceipt)
def get_sale_receipt(
    sale_id: int,
    access: BusinessAccess = Depends(require_business_roles(ALLOWED_ROLES)),
    db: Session = Depends(get_db),
):
    sale = db.execute(
        select(Sale).where(
            Sale.id == sale_id,
            Sale.business_id == access.business.id,
        )
    ).scalar_one_or_none()
    if sale is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sale not found",
        )
    if access.role == "cashier" and sale.cashier_id != access.user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own sales",
        )

    cashier = db.execute(
        select(User).where(User.id == sale.cashier_id)
    ).scalar_one()
    settings = sale.receipt_snapshot or build_receipt_config(
        db, access.business, cashier.full_name
    )
    items = db.execute(
        select(SaleItem).where(SaleItem.sale_id == sale.id)
    ).scalars().all()

    return SaleReceipt(
        id=sale.id,
        reference_no=sale.reference_no,
        business_name=str(settings.get("business_name") or access.business.name),
        cashier_name=str(settings.get("cashier_name") or cashier.full_name),
        items=[
            ReceiptItem(
                product_name=item.product.name,
                quantity=item.quantity,
                unit_price=float(item.unit_price),
                subtotal=float(item.subtotal),
                custom_attributes=(
                    item.custom_attributes
                    or (item.product.custom_attributes if item.product else {})
                    or {}
                ),
            )
            for item in items
        ],
        subtotal=float(sale.subtotal),
        total=float(sale.total),
        payment_method=sale.payment_method,
        customer_phone=sale.customer_phone,
        created_at=sale.created_at,
        settings=settings,
    )


@router.get("", response_model=SaleHistoryResponse)
@router.get("/", response_model=SaleHistoryResponse)
def list_sales(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    access: BusinessAccess = Depends(require_business_roles(ALLOWED_ROLES)),
    db: Session = Depends(get_db),
):
    query = select(Sale).where(Sale.business_id == access.business.id)
    if access.role == "cashier":
        query = query.where(Sale.cashier_id == access.user_id)

    total = int(
        db.execute(
            select(func.count()).select_from(query.subquery())
        ).scalar_one()
    )
    sales = db.execute(
        query.order_by(Sale.created_at.desc(), Sale.id.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    ).scalars().all()

    sale_ids = [sale.id for sale in sales]
    cashier_ids = {sale.cashier_id for sale in sales}

    cashiers = {}
    if cashier_ids:
        cashiers = {
            user.id: user.full_name
            for user in db.execute(
                select(User).where(User.id.in_(cashier_ids))
            ).scalars().all()
        }

    item_counts = {}
    if sale_ids:
        item_counts = dict(
            db.execute(
                select(SaleItem.sale_id, func.count(SaleItem.id))
                .where(SaleItem.sale_id.in_(sale_ids))
                .group_by(SaleItem.sale_id)
            ).all()
        )

    items = [
        SaleHistoryItem(
            id=sale.id,
            reference_no=sale.reference_no,
            total=float(sale.total),
            payment_method=sale.payment_method,
            status=sale.status,
            created_at=sale.created_at,
            cashier_name=cashiers.get(sale.cashier_id, "Unknown"),
            item_count=int(item_counts.get(sale.id, 0)),
        )
        for sale in sales
    ]

    return SaleHistoryResponse(
        items=items,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=max(1, (total + page_size - 1) // page_size),
    )
