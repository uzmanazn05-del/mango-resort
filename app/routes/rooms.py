from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.room import Room
from app.schemas.room import RoomCreate, RoomResponse


router = APIRouter(
    prefix="/rooms",
    tags=["Rooms"]
)


# API 1: Add a new room
@router.post("/", response_model=RoomResponse)
def create_room(
    room: RoomCreate,
    db: Session = Depends(get_db)
):
    existing_room = db.query(Room).filter(
        Room.room_number == room.room_number
    ).first()

    if existing_room:
        raise HTTPException(
            status_code=409,
            detail="Room number already exists"
        )

    new_room = Room(**room.model_dump())

    db.add(new_room)
    db.commit()
    db.refresh(new_room)

    return new_room


# API 2: Get all rooms
@router.get("/", response_model=list[RoomResponse])
def get_rooms(db: Session = Depends(get_db)):

    return db.query(Room).order_by(
        Room.room_id.desc()
    ).all()


# API 3: Get room by ID
@router.get("/{room_id}", response_model=RoomResponse)
def get_room(
    room_id: int,
    db: Session = Depends(get_db)
):
    room = db.query(Room).filter(
        Room.room_id == room_id
    ).first()

    if not room:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    return room


# API 4: Update room
@router.put("/{room_id}", response_model=RoomResponse)
def update_room(
    room_id: int,
    updated_data: RoomCreate,
    db: Session = Depends(get_db)
):
    room = db.query(Room).filter(
        Room.room_id == room_id
    ).first()

    if not room:
        raise HTTPException(
            status_code=404,
            detail="Room not found"
        )

    duplicate = db.query(Room).filter(
        Room.room_number == updated_data.room_number,
        Room.room_id != room_id
    ).first()

    if duplicate:
        raise HTTPException(
            status_code=409,
            detail="Room number already exists"
        )

    for key, value in updated_data.model_dump().items():
        setattr(room, key, value)

    db.commit()
    db.refresh(room)

    return room