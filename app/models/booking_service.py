
from sqlalchemy import Column, Integer, Numeric, ForeignKey
from sqlalchemy.orm import relationship

from app.database import Base


class BookingService(Base):
    __tablename__ = "booking_services"

    booking_service_id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    booking_id = Column(
        Integer,
        ForeignKey("bookings.booking_id"),
        nullable=False
    )

    service_id = Column(
        Integer,
        ForeignKey("services.service_id"),
        nullable=False
    )

    quantity = Column(Integer, nullable=False)

    unit_price = Column(Numeric(12, 2), nullable=False)

    booking = relationship("Booking")

    service = relationship(
        "Service",
        back_populates="booking_services"
    )
