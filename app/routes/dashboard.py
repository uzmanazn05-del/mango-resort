from datetime import datetime
from zoneinfo import ZoneInfo
from datetime import timedelta

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.booking import Booking
from app.models.customer import Customer
from app.models.room import Room
from app.models.room_type import RoomType
from app.models.payment import Payment

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

IST = ZoneInfo("Asia/Kolkata")


def currency(value):
    return f"₹{float(value or 0):,.0f}"


def initials(name):
    parts = (name or "").strip().split()
    return "".join(part[0] for part in parts[:2]).upper() or "GU"


@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):

    today = datetime.now(IST).date()
    month_start = today.replace(day=1)

    # Previous month date range
    if today.month == 1:
        previous_month_start = month_start.replace(
            year=today.year - 1, month=12
        )
    else:
        previous_month_start = month_start.replace(
            month=today.month - 1
        )

    # ---------------------------------
    # BOOKINGS
    # ---------------------------------

    active_bookings = db.query(Booking).filter(
        Booking.booking_status != "Cancelled"
    ).all()

    total_bookings = len(active_bookings)

    # ---------------------------------
    # REVENUE: COMPLETED PAYMENTS
    # ---------------------------------

    revenue_this_month = db.query(
        func.coalesce(func.sum(Payment.amount), 0)
    ).filter(
        Payment.payment_status == "Completed",
        Payment.payment_date >= datetime.combine(
            month_start, datetime.min.time(), tzinfo=IST
        ),
        Payment.payment_date < datetime.combine(
    today + timedelta(days=1),
    datetime.min.time(),
    tzinfo=IST
) + __import__("datetime").timedelta(days=1)
    ).scalar() or 0

    # Previous month revenue for comparison
    previous_month_revenue = db.query(
        func.coalesce(func.sum(Payment.amount), 0)
    ).filter(
        Payment.payment_status == "Completed",
        Payment.payment_date >= datetime.combine(
            previous_month_start, datetime.min.time(), tzinfo=IST
        ),
        Payment.payment_date < datetime.combine(
            month_start, datetime.min.time(), tzinfo=IST
        )
    ).scalar() or 0

    # ---------------------------------
    # ROOM OCCUPANCY FOR TODAY
    # ---------------------------------

    rooms = db.query(Room).all()

    total_rooms = len(rooms)

    maintenance_room_ids = {
        room.room_id
        for room in rooms
        if (room.status or "").strip().lower() == "maintenance"
    }

    today_bookings = [
        booking for booking in active_bookings
        if booking.check_in <= today < booking.check_out
    ]

    entire_resort_booked = any(
        booking.booking_type == "entire_resort"
        for booking in today_bookings
    )

    occupied_room_ids = {
        booking.room_id
        for booking in today_bookings
        if booking.booking_type != "entire_resort"
        and booking.room_id is not None
    }

    if entire_resort_booked:
        occupied_rooms = total_rooms - len(maintenance_room_ids)
    else:
        occupied_rooms = len(
            occupied_room_ids - maintenance_room_ids
        )

    maintenance_rooms = len(maintenance_room_ids)
    available_rooms = max(
        0, total_rooms - occupied_rooms - maintenance_rooms
    )

    occupancy_percentage = (
        round((occupied_rooms / total_rooms) * 100)
        if total_rooms else 0
    )

    # ---------------------------------
    # TODAY'S GUEST ACTIVITY
    # ---------------------------------

    check_ins_today = sum(
        1 for booking in active_bookings
        if booking.check_in == today
    )

    check_outs_today = sum(
        1 for booking in active_bookings
        if booking.check_out == today
    )

    guests_staying = sum(
        booking.guests for booking in today_bookings
    )

    # ---------------------------------
    # OUTSTANDING BOOKING BALANCE
    # ---------------------------------

    completed_payments = db.query(
        Payment.booking_id,
        func.sum(Payment.amount).label("paid")
    ).filter(
        Payment.payment_status == "Completed"
    ).group_by(
        Payment.booking_id
    ).all()

    paid_by_booking = {
        row.booking_id: float(row.paid or 0)
        for row in completed_payments
    }

    outstanding_amount = 0

    for booking in active_bookings:
        booking_total = float(booking.total_booking_amount or 0)
        paid_amount = paid_by_booking.get(booking.booking_id, 0)
        outstanding_amount += max(0, booking_total - paid_amount)

    # ---------------------------------
    # RECENT BOOKINGS
    # ---------------------------------

    recent_booking_rows = (
        db.query(Booking, Customer, Room, RoomType)
        .join(
            Customer,
            Booking.customer_id == Customer.customer_id
        )
        .outerjoin(
            Room,
            Booking.room_id == Room.room_id
        )
        .outerjoin(
            RoomType,
            Room.room_type_id == RoomType.room_type_id
        )
        .order_by(Booking.booking_id.desc())
        .limit(6)
        .all()
    )

    recent_bookings = []

    for booking, customer, room, room_type in recent_booking_rows:
        if booking.booking_type == "entire_resort":
            room_name = "Entire Resort"
        elif room_type:
            room_name = room_type.type_name
        else:
            room_name = "Room not assigned"

        recent_bookings.append({
            "id": f"BK-{booking.booking_id:04d}",
            "name": customer.full_name,
            "initials": initials(customer.full_name),
            "room": room_name,
            "checkin": booking.check_in.strftime("%d %b %Y"),
            "checkout": booking.check_out.strftime("%d %b %Y"),
            "amount": currency(booking.total_booking_amount),
            "status": booking.booking_status or "Unknown"
        })

    # ---------------------------------
    # RECENT COMPLETED TRANSACTIONS
    # ---------------------------------

    recent_payment_rows = (
        db.query(Payment, Booking, Customer)
        .join(
            Booking,
            Payment.booking_id == Booking.booking_id
        )
        .join(
            Customer,
            Booking.customer_id == Customer.customer_id
        )
        .filter(Payment.payment_status == "Completed")
        .order_by(
            Payment.payment_date.desc(),
            Payment.payment_id.desc()
        )
        .limit(5)
        .all()
    )

    recent_transactions = []

    for payment, booking, customer in recent_payment_rows:
        payment_time = payment.payment_date

        recent_transactions.append({
            "name": customer.full_name,
            "initials": initials(customer.full_name),
            "type": (
                "Entire resort booking"
                if booking.booking_type == "entire_resort"
                else "Room booking"
            ),
            "method": payment.payment_method,
            "amount": f"+{currency(payment.amount)}",
            "time": (
                payment_time.strftime("%d %b, %I:%M %p")
                if payment_time else "Date not recorded"
            )
        })

    return {
        "date": today.isoformat(),
        "statistics": {
            "revenue_this_month": float(revenue_this_month),
            "previous_month_revenue": float(previous_month_revenue),
            "total_bookings": total_bookings,
            "available_rooms": available_rooms,
            "total_rooms": total_rooms,
            "pending_payments": round(outstanding_amount, 2)
        },
        "occupancy": {
            "occupied": occupied_rooms,
            "available": available_rooms,
            "maintenance": maintenance_rooms,
            "total": total_rooms,
            "percentage": occupancy_percentage
        },
        "activity": {
            "check_ins": check_ins_today,
            "check_outs": check_outs_today,
            "guests_staying": guests_staying
        },
        "recent_bookings": recent_bookings,
        "recent_transactions": recent_transactions
    }