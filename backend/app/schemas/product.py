from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel, ConfigDict, Field


class ProductBase(BaseModel):
    name: str = Field(min_length=2)
    category: str = "General"
    sku: Optional[str] = None
    barcode: Optional[str] = None
    price: float = Field(gt=0)
    cost_price: float = Field(default=0, ge=0)
    stock_quantity: int = Field(default=0, ge=0)
    low_stock_threshold: int = Field(default=5, ge=0)
    custom_attributes: Dict[str, Any] = Field(default_factory=dict)


class ProductCreate(ProductBase):
    model_config = ConfigDict(extra="ignore")


class ProductUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: Optional[str] = Field(default=None, min_length=2)
    category: Optional[str] = None
    sku: Optional[str] = None
    barcode: Optional[str] = None
    price: Optional[float] = Field(default=None, gt=0)
    cost_price: Optional[float] = Field(default=None, ge=0)
    stock_quantity: Optional[int] = Field(default=None, ge=0)
    low_stock_threshold: Optional[int] = Field(default=None, ge=0)
    is_active: Optional[bool] = None
    custom_attributes: Optional[Dict[str, Any]] = None


class ProductResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    business_id: int
    is_active: bool
    created_at: datetime
