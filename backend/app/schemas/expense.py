from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

ExpenseCategory = Literal[
    "Generator & Fuel",
    "Rent & Utilities",
    "Staff & Wages",
    "Transport & Delivery",
    "Maintenance",
    "General Supplies",
]


class ExpenseCreate(BaseModel):
    category: ExpenseCategory
    amount: float = Field(gt=0)
    description: str = Field(min_length=2)
    date: date


class ExpenseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    business_id: int
    user_id: int
    category: str
    amount: float
    description: str
    date: date
    created_at: datetime
    recorded_by: str = "Unknown"
