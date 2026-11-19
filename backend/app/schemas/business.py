from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

Industry = Literal[
    "Supermarket",
    "Pharmacy",
    "Boutique",
    "Restaurant",
    "Electronics",
    "General Retail",
]


class BusinessCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: str = Field(min_length=2)
    industry: Industry
    phone: Optional[str] = None
    address: Optional[str] = None
    currency: str = "NLe"


class BusinessUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: Optional[str] = Field(default=None, min_length=2)
    industry: Optional[Industry] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    currency: Optional[str] = None


class BusinessResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    industry: str
    currency: str
    phone: Optional[str]
    address: Optional[str]
    status: str
    owner_id: int
    created_at: datetime


class MyBusinessItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    business: BusinessResponse
    role: str
