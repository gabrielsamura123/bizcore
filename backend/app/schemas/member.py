from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

MemberRole = Literal["manager", "cashier", "inventory"]


class MemberCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    full_name: str = Field(min_length=2)
    email: EmailStr
    password: str = Field(min_length=6)
    role: MemberRole


class MemberRoleUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    role: MemberRole


class MemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    full_name: str
    email: str
    role: str
    created_at: datetime
