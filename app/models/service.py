
from sqlalchemy import Column, Integer, String, Text, Numeric, Boolean
from sqlalchemy.orm import relationship

from app.database import Base


class Service(Base):
    __tablename__ = "services"

    service_id = Column(Integer, primary_key=True, index=True)

    service_name = Column(String, nullable=False)

    price = Column(Numeric(12, 2), nullable=False)

    description = Column(Text, nullable=True)

    is_active = Column(Boolean, nullable=True)

    booking_services = relationship(
        "BookingService",
        back_populates="service"
    )
