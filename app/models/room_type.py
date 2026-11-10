from sqlalchemy import Column, Integer, String, Text, Numeric
from sqlalchemy.orm import relationship

from app.database import Base


class RoomType(Base):
    __tablename__ = "room_types"

    room_type_id = Column(Integer, primary_key=True, index=True)
    type_name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    base_price = Column(Numeric(10, 2), nullable=False)
    capacity = Column(Integer, nullable=False)

    rooms = relationship("Room", back_populates="room_type")