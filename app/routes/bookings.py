
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.booking import Booking
from app.models.customer import Customer
from app.models.room import Room
from app.models.resort_pricing import ResortPricing
from app.schemas.booking import BookingCreate, BookingResponse

router = APIRouter(prefix="/bookings", tags=["Bookings"])


@router.post("/", response_model=BookingResponse)
def create_booking(data: BookingCreate, db: Session = Depends(get_db)):

    if data.check_out <= data.check_in:
        raise HTTPException(
            status_code=400,
            detail="Check-out must be after check-in"
        )

    if data.guests < 1 or data.guests > 30:
        raise HTTPException(
            status_code=400,
            detail="Guest count must be between 1 and 30"
        )

    customer = db.query(Customer).filter(
        Customer.customer_id == data.customer_id
    ).first()

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    if data.booking_type == "entire_resort":

        if data.room_id is not None:
            raise HTTPException(
                status_code=400,
                detail="Do not select an individual room for an entire resort booking"
            )

        pricing = db.query(ResortPricing).filter(
            ResortPricing.min_guests <= data.guests,
            ResortPricing.max_guests >= data.guests,
            ResortPricing.is_active == True
        ).first()

        if not pricing:
            raise HTTPException(
                status_code=400,
                detail="No active resort pricing slab exists for this guest count"
            )

        overlapping_booking = db.query(Booking).filter(
            Booking.booking_status != "Cancelled",
            Booking.check_in < data.check_out,
            Booking.check_out > data.check_in
        ).first()

        if overlapping_booking:
            raise HTTPException(
                status_code=409,
                detail="Resort is already booked for these dates"
            )

    else:

        if data.room_id is None:
            raise HTTPException(
                status_code=400,
                detail="Please select a room"
            )

        room = db.query(Room).filter(
            Room.room_id == data.room_id
        ).first()

        if not room:
            raise HTTPException(
                status_code=404,
                detail="Room not found"
            )

        if room.status == "Maintenance":
            raise HTTPException(
                status_code=400,
                detail="This room is under maintenance"
            )

        if data.guests > room.room_type.capacity:
            raise HTTPException(
                status_code=400,
                detail=f"This room allows only {room.room_type.capacity} guests"
            )

        overlapping_booking = db.query(Booking).filter(
            Booking.booking_status != "Cancelled",
            Booking.check_in < data.check_out,
            Booking.check_out > data.check_in
        ).filter(
            (Booking.booking_type == "entire_resort") |
            (Booking.room_id == data.room_id)
        ).first()

        if overlapping_booking:
            raise HTTPException(
                status_code=409,
                detail="Room or entire resort is already booked for these dates"
            )

   
    # Calculate total nights
    total_nights = (data.check_out - data.check_in).days

    # Calculate nightly price
    if data.booking_type == "entire_resort":
        price_per_night = pricing.price_per_night

    else:
        price_per_night = room.room_type.base_price

    # Calculate total booking amount
    total_booking_amount = price_per_night * total_nights

    # Create booking
    booking = Booking(
        customer_id=data.customer_id,
        room_id=data.room_id,
        booking_type=data.booking_type,
        check_in=data.check_in,
        check_out=data.check_out,
        check_in_time=data.check_in_time,
        check_out_time=data.check_out_time,
        guests=data.guests,
        adults=data.adults,
        children=data.children,
        booking_source=data.booking_source,
        booking_status=data.booking_status,
        total_nights=total_nights,
        price_per_night=price_per_night,
        total_booking_amount=total_booking_amount
    )


    try:
        db.add(booking)
        db.commit()
        db.refresh(booking)
        return booking

    except Exception:
        import traceback
        db.rollback()
        traceback.print_exc()

        raise HTTPException(
            status_code=500,
            detail="Unable to create booking"
        )


@router.get("/", response_model=list[BookingResponse])
def get_bookings(db: Session = Depends(get_db)):
    return db.query(Booking).order_by(
        Booking.booking_id.desc()
    ).all()


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(booking_id: int, db: Session = Depends(get_db)):

    booking = db.query(Booking).filter(
        Booking.booking_id == booking_id
    ).first()

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    return booking

@router.put("/{booking_id}", response_model=BookingResponse)
def update_booking(
    booking_id: int,
    data: BookingCreate,
    db: Session = Depends(get_db)
):
    booking = db.query(Booking).filter(
        Booking.booking_id == booking_id
    ).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if data.check_out <= data.check_in:
        raise HTTPException(status_code=400, detail="Check-out must be after check-in")

    if data.guests < 1 or data.guests > 30:
        raise HTTPException(status_code=400, detail="Guest count must be between 1 and 30")

    customer = db.query(Customer).filter(
        Customer.customer_id == data.customer_id
    ).first()

    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Check availability, excluding the current booking
    if data.booking_type == "entire_resort":

        if data.room_id is not None:
            raise HTTPException(
                status_code=400,
                detail="Do not select a room for an entire resort booking"
            )

        pricing = db.query(ResortPricing).filter(
            ResortPricing.min_guests <= data.guests,
            ResortPricing.max_guests >= data.guests,
            ResortPricing.is_active == True
        ).first()

        if not pricing:
            raise HTTPException(
                status_code=400,
                detail="No active resort pricing slab exists for this guest count"
            )

        overlapping_booking = db.query(Booking).filter(
            Booking.booking_id != booking_id,
            Booking.booking_status != "Cancelled",
            Booking.check_in < data.check_out,
            Booking.check_out > data.check_in
        ).first()

        if overlapping_booking:
            raise HTTPException(
                status_code=409,
                detail="Resort is already booked for these dates"
            )

        price_per_night = pricing.price_per_night

    else:

        if data.room_id is None:
            raise HTTPException(status_code=400, detail="Please select a room")

        room = db.query(Room).filter(
            Room.room_id == data.room_id
        ).first()

        if not room:
            raise HTTPException(status_code=404, detail="Room not found")

        if room.status == "Maintenance":
            raise HTTPException(status_code=400, detail="This room is under maintenance")

        if data.guests > room.room_type.capacity:
            raise HTTPException(
                status_code=400,
                detail=f"This room allows only {room.room_type.capacity} guests"
            )

        overlapping_booking = db.query(Booking).filter(
            Booking.booking_id != booking_id,
            Booking.booking_status != "Cancelled",
            Booking.check_in < data.check_out,
            Booking.check_out > data.check_in
        ).filter(
            (Booking.booking_type == "entire_resort") |
            (Booking.room_id == data.room_id)
        ).first()

        if overlapping_booking:
            raise HTTPException(
                status_code=409,
                detail="Room or entire resort is already booked for these dates"
            )

        price_per_night = room.room_type.base_price

    total_nights = (data.check_out - data.check_in).days
    total_booking_amount = price_per_night * total_nights

    # Update booking fields
    booking.customer_id = data.customer_id
    booking.room_id = data.room_id
    booking.booking_type = data.booking_type
    booking.check_in = data.check_in
    booking.check_out = data.check_out
    booking.check_in_time = data.check_in_time
    booking.check_out_time = data.check_out_time
    booking.guests = data.guests
    booking.adults = data.adults
    booking.children = data.children
    booking.booking_source = data.booking_source
    booking.booking_status = data.booking_status
    booking.total_nights = total_nights
    booking.price_per_night = price_per_night
    booking.total_booking_amount = total_booking_amount

    try:
        db.commit()
        db.refresh(booking)
        return booking

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to update booking"
        )

@router.post("/{booking_id}/recalculate")
def recalculate_booking(booking_id: int, db: Session = Depends(get_db)):

    booking = db.query(Booking).filter(
        Booking.booking_id == booking_id
    ).first()

    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    total_nights = (booking.check_out - booking.check_in).days

    if booking.booking_type == "entire_resort":
        pricing = db.query(ResortPricing).filter(
            ResortPricing.min_guests <= booking.guests,
            ResortPricing.max_guests >= booking.guests,
            ResortPricing.is_active == True
        ).first()

        if not pricing:
            raise HTTPException(status_code=400, detail="No active pricing slab found")

        price_per_night = pricing.price_per_night

    else:
        room = db.query(Room).filter(
            Room.room_id == booking.room_id
        ).first()

        if not room:
            raise HTTPException(status_code=404, detail="Room not found")

        price_per_night = room.room_type.base_price

    booking.total_nights = total_nights
    booking.price_per_night = price_per_night
    booking.total_booking_amount = price_per_night * total_nights

    db.commit()
    db.refresh(booking)

    return booking

@router.post("/{booking_id}/cancel", response_model=BookingResponse)
def cancel_booking(booking_id: int, db: Session = Depends(get_db)):

    booking = db.query(Booking).filter(
        Booking.booking_id == booking_id
    ).first()

    if not booking:
        raise HTTPException(
            status_code=404,
            detail="Booking not found"
        )

    if booking.booking_status == "Cancelled":
        raise HTTPException(
            status_code=400,
            detail="This booking is already cancelled"
        )

    booking.booking_status = "Cancelled"

    try:
        db.commit()
        db.refresh(booking)
        return booking

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Unable to cancel booking"
        )
