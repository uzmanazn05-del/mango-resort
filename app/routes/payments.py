
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.payment import Payment
from app.models.booking import Booking
from app.models.invoice import Invoice
from app.schemas.payment import PaymentCreate, PaymentResponse

router = APIRouter(
    prefix="/payments",
    tags=["Payments"]
)


@router.post("/", response_model=PaymentResponse)
def create_payment(
    payment_data: PaymentCreate,
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(
        Booking.booking_id == payment_data.booking_id
    ).first()

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    if payment_data.invoice_id is not None:
        invoice = db.query(Invoice).filter(
            Invoice.invoice_id == payment_data.invoice_id
        ).first()

        if not invoice:
            raise HTTPException(
                status_code=404,
                detail="Invoice not found"
            )

        if invoice.booking_id != payment_data.booking_id:
            raise HTTPException(
                status_code=400,
                detail="Invoice does not belong to this booking"
            )

    payment = Payment(
        booking_id=payment_data.booking_id,
        invoice_id=payment_data.invoice_id,
        amount=payment_data.amount,
        payment_method=payment_data.payment_method,
        payment_status=payment_data.payment_status,
        transaction_reference=payment_data.transaction_reference,
        payment_date=payment_data.payment_date,
        payment_notes=payment_data.payment_notes
    )

    try:
        db.add(payment)
        db.commit()
        db.refresh(payment)
        return payment

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to save payment. Check backend logs."
        )


@router.get("/", response_model=list[PaymentResponse])
def get_payments(db: Session = Depends(get_db)):
    return db.query(Payment).order_by(
        Payment.payment_id.desc()
    ).all()


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(
    payment_id: int,
    db: Session = Depends(get_db)
):
    payment = db.query(Payment).filter(
        Payment.payment_id == payment_id
    ).first()

    if not payment:
        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    return payment


@router.get("/invoice/{invoice_id}/balance")
def get_invoice_balance(
    invoice_id: int,
    db: Session = Depends(get_db)
):
    invoice = db.query(Invoice).filter(
        Invoice.invoice_id == invoice_id
    ).first()

    if not invoice:
        raise HTTPException(
            status_code=404,
            detail="Invoice not found"
        )

    total_paid = db.query(
        func.coalesce(func.sum(Payment.amount), 0)
    ).filter(
        Payment.booking_id == invoice.booking_id,
        Payment.payment_status == "Completed"
    ).scalar()

    balance_due = invoice.total_amount - total_paid

    return {
        "invoice_id": invoice.invoice_id,
        "booking_id": invoice.booking_id,
        "invoice_total": invoice.total_amount,
        "total_paid": total_paid,
        "balance_due": balance_due
    }

