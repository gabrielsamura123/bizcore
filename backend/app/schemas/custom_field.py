from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

FieldType = Literal["text", "number"]


class CustomFieldCreate(BaseModel):
    field_name: Optional[str] = None
    field_label: str = Field(min_length=2)
    field_type: FieldType = "text"
    is_required: bool = False


class CustomFieldResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    business_id: int
    entity_type: str
    field_name: str
    field_label: str
    field_type: str
    is_required: bool
    created_at: datetime
