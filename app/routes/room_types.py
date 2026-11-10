from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.room_type import RoomType
from app.schemas.room_type import RoomTypeResponse


router = APIRouter(
    prefix="/room-types",
    tags=["Room Types"]
)


# API: Get all room types
@router.get("/", response_model=list[RoomTypeResponse])
def get_room_types(db: Session = Depends(get_db)):

    room_types = db.query(RoomType).order_by(
        RoomType.room_type_id.asc()
    ).all()

    return room_types