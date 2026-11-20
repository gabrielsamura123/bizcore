from datetime import date, datetime, time, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.api.deps import require_business_roles
from app.core.database import get_db
from app.models import Expense, Product, Sale, SaleItem
from app.schemas.analytics import (
    FinancialPeriod,
    FinancialSummary,
    PaymentBreakdown,
    TopSellingProduct,
)

router = APIRouter(
    prefix="/businesses/{business_id}/analytics",
    tags=["analytics"],
)

FINANCE_ROLES = ["owner", "manager"]

SALES = Sale.__table__
SALE_ITEMS = SaleItem.__table__
PRODUCTS = Product.__table__


def period_bounds(period: FinancialPeriod):
    today = date.today()

    if period == "today":
        start = datetime.combine(today, time.min)
        return start, start + timedelta(days=1)

    if period == "this_week":
        start_date = today - timedelta(days=today.weekday())
        start = datetime.combine(start_date, time.min)
        return start, start + timedelta(days=7)

    if period == "this_month":
        start_date = today.replace(day=1)
        start = datetime.combine(start_date, time.min)
        end_date = (start_date + timedelta(days=32)).replace(day=1)
        return start, datetime.combine(end_date, time.min)

    return None, None


def amount(value) -> float:
    return round(float(value or 0), 2)


@router.get("/financial-summary", response_model=FinancialSummary)
def financial_summary(
    period: FinancialPeriod = "today",
    access=Depends(require_business_roles(FINANCE_ROLES)),
    db: Session = Depends(get_db),
):
    start, end = period_bounds(period)
    business_id = access.business.id

    sale_filters = [Sale.business_id == business_id, Sale.status == "completed"]
    sale_table_filters = [
        SALES.c.business_id == business_id,
        SALES.c.status == "completed",
    ]
    expense_filters = [Expense.business_id == business_id]

    if start is not None:
        sale_filters.append(Sale.created_at >= start)
        sale_table_filters.append(SALES.c.created_at >= start)
        expense_filters.append(Expense.date >= start.date())
    if end is not None:
        sale_filters.append(Sale.created_at < end)
        sale_table_filters.append(SALES.c.created_at < end)
        expense_filters.append(Expense.date < end.date())

    gross_revenue = amount(
        db.execute(
            select(func.coalesce(func.sum(Sale.total), 0)).where(*sale_filters)
        ).scalar_one()
    )

    cost_of_goods = amount(
        db.execute(
            select(
                func.coalesce(
                    func.sum(PRODUCTS.c.cost_price * SALE_ITEMS.c.quantity), 0
                )
            )
            .select_from(SALE_ITEMS)
            .join(SALES, SALES.c.id == SALE_ITEMS.c.sale_id)
            .join(PRODUCTS, PRODUCTS.c.id == SALE_ITEMS.c.product_id)
            .where(*sale_table_filters)
        ).scalar_one()
    )

    total_expenses = amount(
        db.execute(
            select(func.coalesce(func.sum(Expense.amount), 0)).where(
                *expense_filters
            )
        ).scalar_one()
    )

    sales_count = int(
        db.execute(
            select(func.count()).select_from(Sale).where(*sale_filters)
        ).scalar_one()
    )

    low_stock_count = int(
        db.execute(
            select(func.count())
            .select_from(Product)
            .where(
                Product.business_id == business_id,
                Product.is_active.is_(True),
                Product.stock_quantity <= Product.low_stock_threshold,
            )
        ).scalar_one()
    )

    payment_rows = db.execute(
        select(Sale.payment_method, func.coalesce(func.sum(Sale.total), 0))
        .where(*sale_filters)
        .group_by(Sale.payment_method)
    ).all()
    payment_totals = {
        "cash": 0.0,
        "orange_money": 0.0,
        "africell_money": 0.0,
    }
    for method, total in payment_rows:
        if method in payment_totals:
            payment_totals[method] = amount(total)

    top_rows = db.execute(
        select(
            PRODUCTS.c.name,
            func.coalesce(func.sum(SALE_ITEMS.c.quantity), 0),
            func.coalesce(func.sum(SALE_ITEMS.c.subtotal), 0),
        )
        .select_from(SALE_ITEMS)
        .join(SALES, SALES.c.id == SALE_ITEMS.c.sale_id)
        .join(PRODUCTS, PRODUCTS.c.id == SALE_ITEMS.c.product_id)
        .where(*sale_table_filters)
        .group_by(PRODUCTS.c.id, PRODUCTS.c.name)
        .order_by(func.sum(SALE_ITEMS.c.quantity).desc())
        .limit(3)
    ).all()

    gross_profit = round(gross_revenue - cost_of_goods, 2)
    net_profit = round(gross_profit - total_expenses, 2)

    return FinancialSummary(
        period=period,
        gross_revenue=gross_revenue,
        cost_of_goods=cost_of_goods,
        gross_profit=gross_profit,
        total_expenses=total_expenses,
        net_profit=net_profit,
        sales_count=sales_count,
        low_stock_count=low_stock_count,
        payment_breakdown=PaymentBreakdown(**payment_totals),
        top_selling_products=[
            TopSellingProduct(
                product_name=name,
                quantity_sold=int(quantity),
                revenue=amount(revenue),
            )
            for name, quantity, revenue in top_rows
        ],
    )
