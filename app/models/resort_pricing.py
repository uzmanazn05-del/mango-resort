
from sqlalchemy import Column, Integer, Numeric, Boolean
from app.database import Base


class ResortPricing(Base):
    __tablename__ = "resort_pricing"

    pricing_id = Column(Integer, primary_key=True, index=True)

    min_guests = Column(Integer, nullable=False)

    max_guests = Column(Integer, nullable=False)

    price_per_night = Column(Numeric(12, 2), nullable=False)

    is_active = Column(Boolean, default=True)
