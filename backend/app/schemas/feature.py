from pydantic import BaseModel, ConfigDict


class FeatureItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    key: str
    name: str
    description: str
    category: str
    is_core: bool


class BusinessFeatureItem(FeatureItem):
    is_enabled: bool


class FeatureToggleRequest(BaseModel):
    feature_key: str
    is_enabled: bool


class FeatureToggleResponse(BaseModel):
    feature_key: str
    is_enabled: bool
    message: str


class EnabledFeaturesResponse(BaseModel):
    business_id: int
    features: list[str]
