
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from decimal import Decimal


class InvoiceItemCreate(BaseModel):
    description: str
    quantity: int = Field(gt=0)
    unit_price: Decimal = Field(ge=0)
    tax_rate: Decimal = Field(default=Decimal("0"), ge=0)
    sac_code: str | None = None
    discount_amount: Decimal = Field(default=Decimal("0"), ge=0)


class InvoiceCreate(BaseModel):
    booking_id: int
    invoice_number: str
    invoice_type: str = "Final"

    subtotal: Decimal = Field(ge=0)
    tax_amount: Decimal = Field(default=Decimal("0"), ge=0)
    total_amount: Decimal = Field(ge=0)

    cgst_amount: Decimal = Field(default=Decimal("0"), ge=0)
    sgst_amount: Decimal = Field(default=Decimal("0"), ge=0)
    igst_amount: Decimal = Field(default=Decimal("0"), ge=0)
    discount_amount: Decimal = Field(default=Decimal("0"), ge=0)
    taxable_amount: Decimal = Field(default=Decimal("0"), ge=0)
    rounding_adjustment: Decimal = Decimal("0")

    place_of_supply: str | None = None

    items: list[InvoiceItemCreate] = Field(default_factory=list)


class InvoiceItemResponse(BaseModel):
    item_id: int
    description: str
    quantity: int
    unit_price: Decimal
    total_price: Decimal
    tax_rate: Decimal | None = None
    taxable_amount: Decimal | None = None
    cgst_amount: Decimal | None = None
    sgst_amount: Decimal | None = None
    igst_amount: Decimal | None = None
    sac_code: str | None = None
    discount_amount: Decimal | None = None

    model_config = ConfigDict(from_attributes=True)


class InvoiceResponse(BaseModel):
    invoice_id: int
    booking_id: int
    invoice_number: str
    invoice_type: str | None = None

    subtotal: Decimal
    tax_amount: Decimal | None = None
    total_amount: Decimal
    paid_amount: Decimal = Decimal("0.00")
    balance_due: Decimal = Decimal("0.00")
    invoice_date: datetime | None = None
    invoice_status: str | None = None

    customer_name: str | None = None
    customer_phone: str | None = None
    customer_email: str | None = None
    customer_address: str | None = None

    amount_in_words: str | None = None

    items: list[InvoiceItemResponse] = Field(default_factory=list)

    discount_amount: Decimal | None = None
    taxable_amount: Decimal | None = None

    supplier_name: str | None = None
    supplier_gstin: str | None = None
    supplier_address: str | None = None
    supplier_state_code: str | None = None

    cgst_amount: Decimal | None = None
    sgst_amount: Decimal | None = None
    igst_amount: Decimal | None = None
    rounding_adjustment: Decimal | None = None

    place_of_supply: str | None = None

    special_instructions: str | None = None
    terms_conditions: str | None = None
    thank_you_message: str | None = None

    room_number: str | None = None
    room_category: str | None = None

    guest_count: int | None = None
    adults: int | None = None
    children: int | None = None

    check_in_at: datetime | None = None
    check_out_at: datetime | None = None
    total_nights: int | None = None

    model_config = ConfigDict(from_attributes=True)
