
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.customer import Customer
from app.models.booking import Booking
from app.schemas.customer import CustomerCreate, CustomerResponse


router = APIRouter(
    prefix="/customers",
    tags=["Customers"]
)


# API 1: Add a new customer
@router.post("/", response_model=CustomerResponse)
def create_customer(
    customer: CustomerCreate,
    db: Session = Depends(get_db)
):

    # Check whether phone number already exists
    existing_customer = db.query(Customer).filter(
        Customer.phone == customer.phone
    ).first()

    if existing_customer:
        raise HTTPException(
            status_code=409,
            detail="Customer already exists"
        )

    # Create customer object
    new_customer = Customer(**customer.model_dump())

    # Save customer in PostgreSQL
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)

    return new_customer


# API 2: Get all customers
@router.get("/", response_model=list[CustomerResponse])
def get_customers(db: Session = Depends(get_db)):

    customers = db.query(Customer).order_by(
        Customer.customer_id.desc()
    ).all()

    return customers


# API 3: Get customer by ID
@router.get("/{customer_id}", response_model=CustomerResponse)
def get_customer(
    customer_id: int,
    db: Session = Depends(get_db)
):

    customer = db.query(Customer).filter(
        Customer.customer_id == customer_id
    ).first()

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    return customer

from app.schemas.customer import CustomerCreate

@router.put("/{customer_id}", response_model=CustomerResponse)
def update_customer(
    customer_id: int,
    updated_data: CustomerCreate,
    db: Session = Depends(get_db)
):
    customer = db.query(Customer).filter(
        Customer.customer_id == customer_id
    ).first()

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    # Check if another customer already uses this phone
    duplicate = db.query(Customer).filter(
        Customer.phone == updated_data.phone,
        Customer.customer_id != customer_id
    ).first()

    if duplicate:
        raise HTTPException(
            status_code=409,
            detail="Phone number already belongs to another customer"
        )

    for key, value in updated_data.model_dump().items():
        setattr(customer, key, value)

    db.commit()
    db.refresh(customer)

    return customer
# API 5: Delete customer
@router.delete("/{customer_id}")
def delete_customer(
    customer_id: int,
    db: Session = Depends(get_db)
):
    # Find customer
    customer = db.query(Customer).filter(
        Customer.customer_id == customer_id
    ).first()

    if not customer:
        raise HTTPException(
            status_code=404,
            detail="Customer not found"
        )

    # Check whether customer has existing bookings
    existing_booking = db.query(Booking).filter(
        Booking.customer_id == customer_id
    ).first()

    if existing_booking:
        raise HTTPException(
            status_code=409,
            detail="Cannot delete customer because bookings exist."
        )

    # Delete customer
    db.delete(customer)
    db.commit()

    return {
        "message": "Customer deleted successfully"
    }