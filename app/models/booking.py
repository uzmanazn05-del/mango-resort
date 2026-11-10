
from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    DateTime,
    Time,
    Numeric,
    ForeignKey
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Booking(Base):
    __tablename__ = "bookings"

    booking_id = Column(Integer, primary_key=True, index=True)

    customer_id = Column(
        Integer,
        ForeignKey("customers.customer_id"),
        nullable=False
    )

    room_id = Column(
        Integer,
        ForeignKey("rooms.room_id"),
        nullable=True
    )
    booking_type = Column(
    String(30),
    nullable=False,
    default="individual_room"
)

    check_in = Column(Date, nullable=False)
    check_out = Column(Date, nullable=False)

    check_in_time = Column(Time, nullable=True)
    check_out_time = Column(Time, nullable=True)

    guests = Column(Integer, nullable=False)

    adults = Column(Integer, default=1)
    children = Column(Integer, default=0)

    booking_source = Column(String, nullable=False)
    booking_status = Column(String, nullable=True)

    total_nights = Column(Integer, nullable=True)
    price_per_night = Column(Numeric(12, 2), nullable=True)
    total_booking_amount = Column(Numeric(12, 2), nullable=True)

    created_at = Column(DateTime, server_default=func.now())

    # Relationships
    room = relationship("Room")
