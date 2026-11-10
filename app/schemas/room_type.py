from pydantic import BaseModel, ConfigDict
from decimal import Decimal


class RoomTypeResponse(BaseModel):
    room_type_id: int
    type_name: str
    description: str | None = None
    base_price: Decimal
    capacity: int

    model_config = ConfigDict(from_attributes=True)