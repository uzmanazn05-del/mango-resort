
from sqlalchemy import (
    Column,
    Integer,
    String,
    Numeric,
    ForeignKey
)
from sqlalchemy.orm import relationship
from app.database import Base


class InvoiceItem(Base):
    __tablename__ = "invoice_items"

    item_id = Column(Integer, primary_key=True, index=True)

    invoice_id = Column(
        Integer,
        ForeignKey("invoices.invoice_id"),
        nullable=False
    )

    description = Column(String, nullable=False)

    quantity = Column(Integer, nullable=False)

    unit_price = Column(Numeric(12, 2), nullable=False)

    total_price = Column(Numeric(12, 2), nullable=False)

    tax_rate = Column(Numeric(5, 2), nullable=True)

    taxable_amount = Column(Numeric(12, 2), nullable=True)

    cgst_amount = Column(Numeric(12, 2), nullable=True)

    sgst_amount = Column(Numeric(12, 2), nullable=True)

    igst_amount = Column(Numeric(12, 2), nullable=True)

    sac_code = Column(String, nullable=True)

    discount_amount = Column(Numeric(12, 2), nullable=True)

    invoice = relationship("Invoice", back_populates="items")
