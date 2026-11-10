from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class Room(Base):
    __tablename__ = "rooms"

    room_id = Column(Integer, primary_key=True, index=True)
    room_number = Column(String, nullable=False)
    room_type_id = Column(
        Integer,
        ForeignKey("room_types.room_type_id"),
        nullable=False
    )
    status = Column(String, nullable=False)

    room_type = relationship("RoomType", back_populates="rooms")