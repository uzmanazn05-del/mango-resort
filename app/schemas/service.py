
from pydantic import BaseModel, ConfigDict, Field
from decimal import Decimal


class ServiceCreate(BaseModel):
    service_name: str = Field(min_length=2, max_length=100)
    price: Decimal = Field(gt=0)
    description: str | None = None
    is_active: bool = True


class ServiceUpdate(BaseModel):
    service_name: str | None = None
    price: Decimal | None = Field(default=None, gt=0)
    description: str | None = None
    is_active: bool | None = None


class ServiceResponse(BaseModel):
    service_id: int
    service_name: str
    price: Decimal
    description: str | None = None
    is_active: bool | None = None

    model_config = ConfigDict(from_attributes=True)
