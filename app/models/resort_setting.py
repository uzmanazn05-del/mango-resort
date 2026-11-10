
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from app.database import Base


class ResortSetting(Base):
    __tablename__ = "resort_settings"

    setting_id = Column(Integer, primary_key=True, index=True)

    resort_name = Column(String, nullable=False)
    legal_name = Column(String, nullable=True)
    gstin = Column(String, nullable=True)

    address = Column(Text, nullable=True)
    city = Column(String, nullable=True)
    state = Column(String, nullable=True)
    state_code = Column(String, nullable=True)
    pincode = Column(String, nullable=True)

    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)

    logo_path = Column(Text, nullable=True)
    signature_path = Column(Text, nullable=True)

    created_at = Column(DateTime, server_default=func.now())

    thank_you_message = Column(Text, nullable=True)
