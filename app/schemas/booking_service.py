
from pydantic import BaseModel, ConfigDict, Field
from decimal import Decimal


class BookingServiceCreate(BaseModel):
    service_id: int
    quantity: int = Field(ge=1)
    unit_price: Decimal = Field(gt=0)


class BookingServiceResponse(BaseModel):
    booking_service_id: int
    booking_id: int
    service_id: int
    quantity: int
    unit_price: Decimal

    model_config = ConfigDict(from_attributes=True)
