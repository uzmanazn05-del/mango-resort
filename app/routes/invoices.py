from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from datetime import datetime, time
from decimal import Decimal, ROUND_HALF_UP
from app.database import get_db
from app.models.invoice import Invoice
from app.models.invoice_items import InvoiceItem
from app.models.booking import Booking
from app.models.customer import Customer
from app.models.resort_setting import ResortSetting
from app.models.payment import Payment
from app.schemas.invoice import InvoiceCreate, InvoiceResponse
from io import BytesIO
from pathlib import Path
from xml.sax.saxutils import escape
from fastapi.responses import StreamingResponse
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image
)

router = APIRouter(prefix="/invoices", tags=["Invoices"])

CENT = Decimal("0.01")


def money(value):
    return Decimal(str(value or 0)).quantize(
        CENT, rounding=ROUND_HALF_UP
    )


def attach_payment_summary(invoice, db):
    paid = db.query(func.coalesce(func.sum(Payment.amount), 0)).filter(
        Payment.booking_id == invoice.booking_id,
        Payment.payment_status == "Completed"
    ).scalar()
    invoice.paid_amount = money(paid)
    invoice.balance_due = money(invoice.total_amount) - invoice.paid_amount
    return invoice


def amount_to_words_indian(amount):
    """Convert an amount into Indian Rupees and Paise words."""
    ones = [
        "Zero", "One", "Two", "Three", "Four",
        "Five", "Six", "Seven", "Eight", "Nine"
    ]
    teens = [
        "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen",
        "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
    ]
    tens = [
        "", "", "Twenty", "Thirty", "Forty",
        "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
    ]

    def under_thousand(number):
        words = []
        if number >= 100:
            words.append(ones[number // 100])
            words.append("Hundred")
            number %= 100
        if number >= 20:
            words.append(tens[number // 10])
            number %= 10
        if number >= 10:
            words.append(teens[number - 10])
        elif number > 0:
            words.append(ones[number])
        return " ".join(words)

    value = money(amount)
    if value < 0:
        return "Negative " + amount_to_words_indian(abs(value))
    rupees = int(value)
    paise = int((value - Decimal(rupees)) * 100)
    parts = []
    crore = rupees // 10000000
    rupees %= 10000000
    lakh = rupees // 100000
    rupees %= 100000
    thousand = rupees // 1000
    rupees %= 1000
    if crore:
        parts.append(under_thousand(crore) + " Crore")
    if lakh:
        parts.append(under_thousand(lakh) + " Lakh")
    if thousand:
        parts.append(under_thousand(thousand) + " Thousand")
    if rupees:
        parts.append(under_thousand(rupees))
    rupee_words = " ".join(parts) if parts else "Zero"
    result = rupee_words + " Rupees"
    if paise:
        result += " and " + under_thousand(paise) + " Paise"
    return result + " Only"


def load_invoice(invoice_id, db):
    invoice = db.query(Invoice).options(
        joinedload(Invoice.items)
    ).filter(
        Invoice.invoice_id == invoice_id
    ).first()
    if invoice:
        attach_payment_summary(invoice, db)
    return invoice


@router.post("/", response_model=InvoiceResponse)
def create_invoice(
    invoice_data: InvoiceCreate,
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(
        Booking.booking_id == invoice_data.booking_id
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.booking_status == "Cancelled":
        raise HTTPException(
            status_code=400,
            detail="Cannot generate an invoice for a cancelled booking"
        )
    invoice_number = invoice_data.invoice_number.strip()
    if not invoice_number:
        raise HTTPException(
            status_code=400,
            detail="Invoice number is required"
        )
    existing_number = db.query(Invoice).filter(
        Invoice.invoice_number == invoice_number
    ).first()
    if existing_number:
        raise HTTPException(
            status_code=400,
            detail="Invoice number already exists"
        )
    invoice_type = invoice_data.invoice_type.strip().lower()
    if invoice_type not in ("booking", "final"):
        raise HTTPException(
            status_code=400,
            detail="Invoice type must be Booking or Final"
        )
    if invoice_type == "final":
        existing_final = db.query(Invoice).filter(
            Invoice.booking_id == booking.booking_id,
            func.lower(Invoice.invoice_type) == "final"
        ).first()
        if existing_final:
            raise HTTPException(
                status_code=400,
                detail="A final invoice already exists for this booking"
            )
    customer = db.query(Customer).filter(
        Customer.customer_id == booking.customer_id
    ).first()
    resort = db.query(ResortSetting).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    if not resort:
        raise HTTPException(
            status_code=404,
            detail="Resort settings not found"
        )
    if not invoice_data.items:
        raise HTTPException(
            status_code=400,
            detail="Add at least one invoice item"
        )

    # Calculate amounts from GST-inclusive invoice line items.
    # The entered unit_price already includes the applicable GST.
    subtotal = Decimal("0.00")
    total_discount = Decimal("0.00")
    taxable_total = Decimal("0.00")
    tax_total = Decimal("0.00")
    cgst_total = Decimal("0.00")
    sgst_total = Decimal("0.00")
    igst_total = Decimal("0.00")
    calculated_items = []

    for item_data in invoice_data.items:
        quantity = item_data.quantity
        unit_price = money(item_data.unit_price)
        discount = money(item_data.discount_amount)
        line_total = money(quantity * unit_price)
        if discount > line_total:
            raise HTTPException(
                status_code=400,
                detail=f"Discount cannot exceed item total: {item_data.description}"
            )
        gross_after_discount = money(line_total - discount)
        tax_rate = Decimal(str(item_data.tax_rate or 0))
        if tax_rate < 0:
            raise HTTPException(
                status_code=400,
                detail="Tax rate cannot be negative"
            )

        # Extract GST from the GST-inclusive amount.
        if tax_rate > 0:
            taxable_amount = money(
                gross_after_discount * Decimal("100")
                / (Decimal("100") + tax_rate)
            )
        else:
            taxable_amount = gross_after_discount
        item_tax = money(gross_after_discount - taxable_amount)

        # This split is for intra-state supplies only.
        # Interstate supplies must use IGST instead.
        item_cgst = money(item_tax / Decimal("2"))
        item_sgst = money(item_tax - item_cgst)
        item_igst = Decimal("0.00")
        subtotal += line_total
        total_discount += discount
        taxable_total += taxable_amount
        tax_total += item_tax
        cgst_total += item_cgst
        sgst_total += item_sgst
        igst_total += item_igst
        calculated_items.append({
            "description": item_data.description,
            "quantity": quantity,
            "unit_price": unit_price,
            "total_price": line_total,
            "tax_rate": tax_rate,
            "taxable_amount": taxable_amount,
            "tax_amount": item_tax,
            "cgst_amount": item_cgst,
            "sgst_amount": item_sgst,
            "igst_amount": item_igst,
            "sac_code": item_data.sac_code,
            "discount_amount": discount
        })

    subtotal = money(subtotal)
    total_discount = money(total_discount)
    taxable_total = money(taxable_total)
    tax_total = money(tax_total)
    cgst_total = money(cgst_total)
    sgst_total = money(sgst_total)
    igst_total = money(igst_total)
    rounding_adjustment = money(invoice_data.rounding_adjustment)

    # GST is included in the entered prices; do not add it again.
    total_amount = money(
        subtotal - total_discount + rounding_adjustment
    )
    invoice = Invoice(
        booking_id=booking.booking_id,
        invoice_number=invoice_number,
        invoice_type="Final" if invoice_type == "final" else "Booking",
        invoice_date=datetime.now(),
        invoice_status="Generated",
        subtotal=subtotal,
        discount_amount=total_discount,
        taxable_amount=taxable_total,
        tax_amount=tax_total,
        total_amount=total_amount,
        cgst_amount=cgst_total,
        sgst_amount=sgst_total,
        igst_amount=igst_total,
        rounding_adjustment=rounding_adjustment,
        place_of_supply=invoice_data.place_of_supply,
        customer_name=customer.full_name,
        customer_phone=customer.phone,
        customer_email=customer.email,
        customer_address=customer.address,
        supplier_name=resort.resort_name,
        supplier_gstin=resort.gstin,
        supplier_address=resort.address,
        supplier_state_code=resort.state_code,
        thank_you_message=resort.thank_you_message,
        guest_count=booking.guests,
        adults=booking.adults,
        children=booking.children,
        total_nights=booking.total_nights,
        check_in_at=datetime.combine(
            booking.check_in,
            booking.check_in_time or time.min
        ),
        check_out_at=datetime.combine(
            booking.check_out,
            booking.check_out_time or time.min
        )
    )
    try:
        db.add(invoice)
        db.flush()
        for item_data in calculated_items:
            item = InvoiceItem(
                invoice_id=invoice.invoice_id,
                description=item_data["description"],
                quantity=item_data["quantity"],
                unit_price=item_data["unit_price"],
                total_price=item_data["total_price"],
                tax_rate=item_data["tax_rate"],
                taxable_amount=item_data["taxable_amount"],
                sac_code=item_data["sac_code"],
                discount_amount=item_data["discount_amount"],
                cgst_amount=item_data["cgst_amount"],
                sgst_amount=item_data["sgst_amount"],
                igst_amount=item_data["igst_amount"]
            )
            db.add(item)
        db.commit()
        return load_invoice(invoice.invoice_id, db)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to create invoice. Check backend logs."
        )


@router.get("/", response_model=list[InvoiceResponse])
def get_invoices(db: Session = Depends(get_db)):
    invoices = db.query(Invoice).options(
        joinedload(Invoice.items)
    ).order_by(
        Invoice.invoice_id.desc()
    ).all()
    return [
        attach_payment_summary(invoice, db)
        for invoice in invoices
    ]


@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(
    invoice_id: int,
    db: Session = Depends(get_db)
):
    invoice = load_invoice(invoice_id, db)
    if not invoice:
        raise HTTPException(
            status_code=404,
            detail="Invoice not found"
        )
    return invoice


@router.get("/{invoice_id}/pdf")
def download_invoice_pdf(
    invoice_id: int,
    db: Session = Depends(get_db)
):
    invoice = db.query(Invoice).options(
        joinedload(Invoice.items)
    ).filter(
        Invoice.invoice_id == invoice_id
    ).first()
    if not invoice:
        raise HTTPException(
            status_code=404,
            detail="Invoice not found"
        )
    resort = db.query(ResortSetting).first()
    payments = db.query(Payment).filter(
        Payment.booking_id == invoice.booking_id,
        Payment.payment_status == "Completed"
    ).order_by(
        Payment.payment_date.asc(),
        Payment.payment_id.asc()
    ).all()
    total_paid = sum(
        (Decimal(str(payment.amount or 0)) for payment in payments),
        Decimal("0.00")
    )
    balance_due = (
        Decimal(str(invoice.total_amount or 0)) - total_paid
    )
    buffer = BytesIO()
    document = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=16 * mm,
        leftMargin=16 * mm,
        topMargin=14 * mm,
        bottomMargin=16 * mm
    )
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        name="ResortTitle",
        parent=styles["Title"],
        fontSize=19,
        leading=23,
        textColor=colors.HexColor("#315B43"),
        alignment=TA_CENTER,
        spaceAfter=5
    ))
    styles.add(ParagraphStyle(
        name="SmallText",
        parent=styles["Normal"],
        fontSize=8,
        leading=11
    ))
    styles.add(ParagraphStyle(
        name="SectionHeading",
        parent=styles["Heading2"],
        fontSize=11,
        leading=14,
        textColor=colors.HexColor("#315B43"),
        spaceBefore=10,
        spaceAfter=6
    ))
    styles.add(ParagraphStyle(
        name="RightText",
        parent=styles["Normal"],
        alignment=TA_RIGHT,
        fontSize=9
    ))

    def safe(value):
        return escape(str(value if value is not None else "—"))

    def currency(value):
        amount = Decimal(str(value or 0))
        return f"Rs. {amount:,.2f}"

    story = []

    # Resort logo: use the saved logo path, with a local fallback.
    logo_path = None
    if resort and resort.logo_path:
        saved_path = Path(resort.logo_path)
        if not saved_path.is_absolute():
            saved_path = (
                Path(__file__).resolve().parents[2] / saved_path
            )
        if saved_path.exists():
            logo_path = saved_path
    if not logo_path:
        fallback_logo = (
            Path(__file__).resolve().parents[2]
            / "uploads"
            / "mango_logo.jpeg"
        )
        if fallback_logo.exists():
            logo_path = fallback_logo
    if logo_path:
        logo = Image(str(logo_path))
        logo._restrictSize(42 * mm, 22 * mm)
        logo_table = Table(
            [[logo]],
            colWidths=[178 * mm]
        )
        logo_table.setStyle(TableStyle([
            ("ALIGN", (0, 0), (-1, -1), "CENTER"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5)
        ]))
        story.append(logo_table)

    story.append(Paragraph(
        safe(invoice.supplier_name or "Mango Estate & Resorts"),
        styles["ResortTitle"]
    ))
    story.append(Paragraph(
        safe(invoice.supplier_address),
        ParagraphStyle(
            "Address",
            parent=styles["SmallText"],
            alignment=TA_CENTER
        )
    ))
    story.append(Paragraph(
        f"GSTIN: {safe(invoice.supplier_gstin)}",
        ParagraphStyle(
            "GST",
            parent=styles["SmallText"],
            alignment=TA_CENTER
        )
    ))
    story.append(Spacer(1, 8))
    story.append(Paragraph(
        "TAX INVOICE / BILL",
        ParagraphStyle(
            "InvoiceHeading",
            parent=styles["Heading1"],
            alignment=TA_CENTER,
            textColor=colors.HexColor("#315B43")
        )
    ))

    invoice_details = [
        [
            Paragraph(
                f"<b>Invoice number:</b> {safe(invoice.invoice_number)}",
                styles["SmallText"]
            ),
            Paragraph(
                f"<b>Invoice date:</b> "
                f"{invoice.invoice_date.strftime('%d-%m-%Y') if invoice.invoice_date else '—'}",
                styles["SmallText"]
            )
        ],
        [
            Paragraph(
                f"<b>Invoice type:</b> {safe(invoice.invoice_type)}",
                styles["SmallText"]
            ),
            Paragraph(
                f"<b>Status:</b> {safe(invoice.invoice_status)}",
                styles["SmallText"]
            )
        ]
    ]
    details_table = Table(
        invoice_details,
        colWidths=[89 * mm, 89 * mm]
    )
    details_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F2F6F2")),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#D5DED6")),
        ("INNERGRID", (0, 0), (-1, -1), 0.3, colors.HexColor("#D5DED6")),
        ("PADDING", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE")
    ]))
    story.append(details_table)

    story.append(Paragraph("Customer details", styles["SectionHeading"]))
    customer_data = [
        ["Customer name", safe(invoice.customer_name)],
        ["Mobile", safe(invoice.customer_phone)],
        ["Email", safe(invoice.customer_email)],
        ["Address", safe(invoice.customer_address)]
    ]
    customer_table = Table(
        customer_data,
        colWidths=[40 * mm, 138 * mm]
    )
    customer_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#F2F6F2")),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#D5DED6")),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("PADDING", (0, 0), (-1, -1), 7),
        ("VALIGN", (0, 0), (-1, -1), "TOP")
    ]))
    story.append(customer_table)

    story.append(Paragraph("Booking details", styles["SectionHeading"]))
    booking_data = [
        ["Booking ID", f"BK-{invoice.booking_id:04d}"],
        ["Guests", str(invoice.guest_count or "—")],
        ["Adults", str(invoice.adults or "—")],
        ["Children", str(invoice.children or "—")],
        ["Check-in", invoice.check_in_at.strftime("%d-%m-%Y %I:%M %p") if invoice.check_in_at else "—"],
        ["Check-out", invoice.check_out_at.strftime("%d-%m-%Y %I:%M %p") if invoice.check_out_at else "—"],
        ["Total nights", str(invoice.total_nights or "—")]
    ]
    booking_table = Table(
        booking_data,
        colWidths=[40 * mm, 138 * mm]
    )
    booking_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), colors.HexColor("#F2F6F2")),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#D5DED6")),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("PADDING", (0, 0), (-1, -1), 6)
    ]))
    story.append(booking_table)

    story.append(Paragraph("Invoice items", styles["SectionHeading"]))
    item_rows = [[
        "Description",
        "Qty",
        "Rate",
        "Discount",
        "Taxable",
        "Tax %",
        "Total"
    ]]
    for item in invoice.items:
        item_rows.append([
            Paragraph(safe(item.description), styles["SmallText"]),
            str(item.quantity),
            currency(item.unit_price),
            currency(item.discount_amount),
            currency(item.taxable_amount),
            f"{item.tax_rate or 0}%",
            currency(item.total_price)
        ])
    item_table = Table(
        item_rows,
        colWidths=[
            48 * mm, 10 * mm, 23 * mm, 21 * mm,
            23 * mm, 14 * mm, 25 * mm
        ],
        repeatRows=1
    )
    item_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#315B43")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 7),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#D5DED6")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [
            colors.white,
            colors.HexColor("#F7F9F7")
        ]),
        ("ALIGN", (1, 1), (-1, -1), "RIGHT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("PADDING", (0, 0), (-1, -1), 5)
    ]))
    story.append(item_table)

    story.append(Paragraph("Invoice summary", styles["SectionHeading"]))
    summary_data = [
        ["Subtotal", currency(invoice.subtotal)],
        ["Discount", currency(invoice.discount_amount)],
        ["Taxable amount", currency(invoice.taxable_amount)],
        ["CGST", currency(invoice.cgst_amount)],
        ["SGST", currency(invoice.sgst_amount)],
        ["IGST", currency(invoice.igst_amount)],
        ["Total tax", currency(invoice.tax_amount)],
        ["Rounding adjustment", currency(invoice.rounding_adjustment)],
        ["Grand total", currency(invoice.total_amount)],
        ["Total paid", currency(total_paid)],
        ["Balance due", currency(balance_due)]
    ]
    summary_table = Table(
        summary_data,
        colWidths=[130 * mm, 48 * mm]
    )
    summary_table.setStyle(TableStyle([
        ("ALIGN", (1, 0), (1, -1), "RIGHT"),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#D5DED6")),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
        ("PADDING", (0, 0), (-1, -1), 6),
        ("BACKGROUND", (0, 8), (-1, 8), colors.HexColor("#E8F0E9")),
        ("FONTNAME", (0, 8), (-1, 8), "Helvetica-Bold"),
        ("BACKGROUND", (0, 10), (-1, 10), colors.HexColor("#F2F6F2")),
        ("FONTNAME", (0, 10), (-1, 10), "Helvetica-Bold")
    ]))
    story.append(summary_table)

    story.append(Paragraph("Payment history", styles["SectionHeading"]))
    payment_rows = [[
        "Date",
        "Method",
        "Reference / Notes",
        "Amount"
    ]]
    for payment in payments:
        payment_rows.append([
            payment.payment_date.strftime("%d-%m-%Y") if payment.payment_date else "—",
            safe(payment.payment_method),
            Paragraph(
                safe(payment.transaction_reference or payment.payment_notes),
                styles["SmallText"]
            ),
            currency(payment.amount)
        ])
    if not payments:
        payment_rows.append([
            "—",
            "No payments recorded",
            "—",
            currency(0)
        ])
    payment_table = Table(
        payment_rows,
        colWidths=[32 * mm, 35 * mm, 75 * mm, 36 * mm],
        repeatRows=1
    )
    payment_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#315B43")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 7),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#D5DED6")),
        ("PADDING", (0, 0), (-1, -1), 6),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE")
    ]))
    story.append(payment_table)

    if invoice.special_instructions:
        story.append(Paragraph(
            "Special instructions",
            styles["SectionHeading"]
        ))
        story.append(Paragraph(
            safe(invoice.special_instructions),
            styles["SmallText"]
        ))
    if invoice.terms_conditions:
        story.append(Paragraph(
            "Terms and conditions",
            styles["SectionHeading"]
        ))
        story.append(Paragraph(
            safe(invoice.terms_conditions),
            styles["SmallText"]
        ))
    if invoice.thank_you_message:
        story.append(Spacer(1, 12))
        story.append(Paragraph(
            safe(invoice.thank_you_message),
            ParagraphStyle(
                "ThankYou",
                parent=styles["Normal"],
                alignment=TA_CENTER,
                textColor=colors.HexColor("#315B43"),
                fontSize=10
            )
        ))
    story.append(Spacer(1, 20))
    story.append(Paragraph(
        "Authorised Signature: __________________________",
        styles["RightText"]
    ))

    document.build(story)
    buffer.seek(0)
    filename = f"{invoice.invoice_number}.pdf"
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )
