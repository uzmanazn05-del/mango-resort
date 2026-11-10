
from sqlalchemy import (
    Column,
    Integer,
    Numeric,
    String,
    DateTime,
    Text,
    ForeignKey
)
from sqlalchemy.orm import relationship
from app.database import Base


class Payment(Base):
    __tablename__ = "payments"

    payment_id = Column(Integer, primary_key=True, index=True)

    booking_id = Column(
        Integer,
        ForeignKey("bookings.booking_id"),
        nullable=False
    )

    invoice_id = Column(
        Integer,
        ForeignKey("invoices.invoice_id"),
        nullable=True
    )

    amount = Column(Numeric(12, 2), nullable=False)

    payment_method = Column(String, nullable=False)

    payment_status = Column(String, nullable=True)

    transaction_reference = Column(String, nullable=True)

    payment_date = Column(DateTime, nullable=True)

    payment_notes = Column(Text, nullable=True)

    booking = relationship("Booking")
    invoice = relationship("Invoice")
