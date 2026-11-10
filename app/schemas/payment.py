
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from decimal import Decimal


class PaymentCreate(BaseModel):
    booking_id: int
    invoice_id: int | None = None
    amount: Decimal = Field(gt=0)
    payment_method: str
    payment_status: str = "Completed"
    transaction_reference: str | None = None
    payment_date: datetime | None = None
    payment_notes: str | None = None


class PaymentResponse(BaseModel):
    payment_id: int
    booking_id: int
    invoice_id: int | None = None
    amount: Decimal
    payment_method: str
    payment_status: str | None = None
    transaction_reference: str | None = None
    payment_date: datetime | None = None
    payment_notes: str | None = None

    model_config = ConfigDict(from_attributes=True)
