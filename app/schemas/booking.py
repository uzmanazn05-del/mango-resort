
from pydantic import BaseModel, ConfigDict, Field
from datetime import date, datetime, time
from typing import Literal
from decimal import Decimal


class BookingCreate(BaseModel):
    customer_id: int
    room_id: int | None = None

    booking_type: Literal[
        "individual_room",
        "entire_resort"
    ] = "individual_room"

    check_in: date
    check_out: date

    guests: int = Field(ge=1, le=30)
    adults: int = Field(default=1, ge=1)
    children: int = Field(default=0, ge=0)

    check_in_time: time | None = None
    check_out_time: time | None = None

    booking_source: str = "reception"
    booking_status: str = "Confirmed"


class BookingResponse(BaseModel):
    booking_id: int
    customer_id: int
    room_id: int | None = None
    booking_type: str

    check_in: date
    check_out: date
    guests: int
    adults: int | None = None
    children: int | None = None

    check_in_time: time | None = None
    check_out_time: time | None = None

    booking_source: str
    booking_status: str | None = None
    created_at: datetime | None = None

    total_nights: int | None = None
    price_per_night: Decimal | None = None
    total_booking_amount: Decimal | None = None

    model_config = ConfigDict(from_attributes=True)
