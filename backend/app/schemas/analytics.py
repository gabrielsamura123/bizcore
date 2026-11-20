from typing import Literal

from pydantic import BaseModel

FinancialPeriod = Literal["today", "this_week", "this_month", "all_time"]


class PaymentBreakdown(BaseModel):
    cash: float
    orange_money: float
    africell_money: float


class TopSellingProduct(BaseModel):
    product_name: str
    quantity_sold: int
    revenue: float


class FinancialSummary(BaseModel):
    period: FinancialPeriod
    gross_revenue: float
    cost_of_goods: float
    gross_profit: float
    total_expenses: float
    net_profit: float
    sales_count: int
    low_stock_count: int
    payment_breakdown: PaymentBreakdown
    top_selling_products: list[TopSellingProduct]
