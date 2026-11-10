
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.booking import Booking
from app.models.service import Service
from app.models.booking_service import BookingService
from app.schemas.booking_service import (
    BookingServiceCreate,
    BookingServiceResponse,
)

router = APIRouter(
    prefix="/booking-services",
    tags=["Booking Services"]
)


@router.post(
    "/{booking_id}",
    response_model=BookingServiceResponse
)
def add_service_to_booking(
    booking_id: int,
    data: BookingServiceCreate,
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(
        Booking.booking_id == booking_id
    ).first()

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    service = db.query(Service).filter(
        Service.service_id == data.service_id,
        Service.is_active == True
    ).first()

    if not service:
        raise HTTPException(
            status_code=404,
            detail="Active service not found"
        )

    booking_service = BookingService(
        booking_id=booking_id,
        service_id=data.service_id,
        quantity=data.quantity,
        unit_price=service.price
    )

    db.add(booking_service)
    db.commit()
    db.refresh(booking_service)

    return booking_service


@router.get(
    "/{booking_id}",
    response_model=list[BookingServiceResponse]
)
def get_booking_services(
    booking_id: int,
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(
        Booking.booking_id == booking_id
    ).first()

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    return db.query(BookingService).filter(
        BookingService.booking_id == booking_id
    ).all()
