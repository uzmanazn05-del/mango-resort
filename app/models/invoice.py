
from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Numeric,
    Text,
    ForeignKey
)
from sqlalchemy.orm import relationship
from app.database import Base
from sqlalchemy.sql import func


class Invoice(Base):
    __tablename__ = "invoices"

    invoice_id = Column(Integer, primary_key=True, index=True)

    booking_id = Column(
        Integer,
        ForeignKey("bookings.booking_id"),
        nullable=False
    )

    invoice_number = Column(String, nullable=False)

    subtotal = Column(Numeric(12, 2), nullable=False)

    tax_amount = Column(Numeric(12, 2), nullable=True)

    total_amount = Column(Numeric(12, 2), nullable=False)

    invoice_date = Column(DateTime, nullable=True)

    cgst_amount = Column(Numeric(12, 2), nullable=True)
    sgst_amount = Column(Numeric(12, 2), nullable=True)
    igst_amount = Column(Numeric(12, 2), nullable=True)

    rounding_adjustment = Column(Numeric(12, 2), nullable=True)

    place_of_supply = Column(String, nullable=True)

    customer_name = Column(String, nullable=True)
    customer_phone = Column(String, nullable=True)
    customer_address = Column(Text, nullable=True)
    customer_gstin = Column(String, nullable=True)

    supplier_name = Column(String, nullable=True)
    supplier_gstin = Column(String, nullable=True)
    supplier_address = Column(Text, nullable=True)
    supplier_state_code = Column(String, nullable=True)

    invoice_status = Column(String, nullable=True)
    amount_in_words = Column(Text, nullable=True)

    invoice_type = Column(String, nullable=True)
    discount_amount = Column(Numeric(12, 2), nullable=True)
    taxable_amount = Column(Numeric(12, 2), nullable=True)

    customer_email = Column(String, nullable=True)

    special_instructions = Column(Text, nullable=True)
    terms_conditions = Column(Text, nullable=True)
    thank_you_message = Column(Text, nullable=True)

    room_number = Column(String, nullable=True)
    room_category = Column(String, nullable=True)

    guest_count = Column(Integer, nullable=True)
    adults = Column(Integer, nullable=True)
    children = Column(Integer, nullable=True)

    check_in_at = Column(DateTime, nullable=True)
    check_out_at = Column(DateTime, nullable=True)

    total_nights = Column(Integer, nullable=True)

    booking = relationship("Booking")

    items = relationship(
        "InvoiceItem",
        back_populates="invoice",
        cascade="all, delete-orphan"
    )
