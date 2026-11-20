from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

PaymentMethod = Literal["cash", "orange_money", "africell_money"]


class CheckoutItem(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)


class CheckoutRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    items: list[CheckoutItem] = Field(min_length=1)
    payment_method: PaymentMethod
    customer_phone: Optional[str] = None


class ReceiptItem(BaseModel):
    product_name: str
    quantity: int
    unit_price: float
    subtotal: float


class SaleReceipt(BaseModel):
    id: int
    reference_no: str
    business_name: str
    cashier_name: str
    items: list[ReceiptItem]
    subtotal: float
    total: float
    payment_method: str
    customer_phone: Optional[str] = None
    created_at: datetime
    settings: dict[str, object] = Field(default_factory=dict)


class SaleHistoryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    reference_no: str
    total: float
    payment_method: str
    status: str
    created_at: datetime
    cashier_name: str = "Unknown"
    item_count: int = 0


class SaleHistoryResponse(BaseModel):
    items: list[SaleHistoryItem]
    total: int
    page: int
    page_size: int
    total_pages: int
