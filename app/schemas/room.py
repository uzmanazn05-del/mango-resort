from pydantic import BaseModel, ConfigDict
from decimal import Decimal


class RoomCreate(BaseModel):
    room_number: str
    room_type_id: int
    status: str = "Available"


class RoomTypeDetails(BaseModel):
    type_name: str
    base_price: Decimal
    capacity: int

    model_config = ConfigDict(from_attributes=True)


class RoomResponse(RoomCreate):
    room_id: int
    room_type: RoomTypeDetails

    model_config = ConfigDict(from_attributes=True)