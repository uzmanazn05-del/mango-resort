
from pydantic import BaseModel, ConfigDict, Field
from decimal import Decimal


class ResortPricingCreate(BaseModel):
    min_guests: int = Field(ge=1, le=30)
    max_guests: int = Field(ge=1, le=30)
    price_per_night: Decimal = Field(gt=0)
    is_active: bool = True


class ResortPricingUpdate(BaseModel):
    min_guests: int = Field(ge=1, le=30)
    max_guests: int = Field(ge=1, le=30)
    price_per_night: Decimal = Field(gt=0)
    is_active: bool


class ResortPricingResponse(BaseModel):
    pricing_id: int
    min_guests: int
    max_guests: int
    price_per_night: Decimal
    is_active: bool | None = None

    model_config = ConfigDict(from_attributes=True)
