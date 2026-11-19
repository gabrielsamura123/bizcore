from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.schemas.business import BusinessResponse


class PlatformStats(BaseModel):
    total_businesses: int
    pending_businesses: int
    active_businesses: int
    suspended_businesses: int
    total_users: int


class AdminBusinessItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    industry: str
    currency: str
    phone: Optional[str]
    address: Optional[str]
    status: str
    created_at: datetime
    owner_name: str
    owner_email: str


class BusinessActionResponse(BaseModel):
    message: str
    business: BusinessResponse
