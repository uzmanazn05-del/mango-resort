
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.resort_pricing import ResortPricing
from app.schemas.resort_pricing import (
    ResortPricingCreate,
    ResortPricingUpdate,
    ResortPricingResponse
)

router = APIRouter(
    prefix="/resort-pricing",
    tags=["Resort Pricing"]
)


def validate_guest_range(min_guests, max_guests):
    if min_guests > max_guests:
        raise HTTPException(
            status_code=400,
            detail="Minimum guests cannot exceed maximum guests"
        )


def check_overlapping_slab(
    db,
    min_guests,
    max_guests,
    exclude_id=None
):
    query = db.query(ResortPricing).filter(
        ResortPricing.min_guests <= max_guests,
        ResortPricing.max_guests >= min_guests
    )

    if exclude_id is not None:
        query = query.filter(
            ResortPricing.pricing_id != exclude_id
        )

    if query.first():
        raise HTTPException(
            status_code=400,
            detail="This guest range overlaps an existing pricing slab"
        )


@router.post("/", response_model=ResortPricingResponse)
def create_pricing(
    pricing_data: ResortPricingCreate,
    db: Session = Depends(get_db)
):
    validate_guest_range(
        pricing_data.min_guests,
        pricing_data.max_guests
    )

    check_overlapping_slab(
        db,
        pricing_data.min_guests,
        pricing_data.max_guests
    )

    pricing = ResortPricing(**pricing_data.model_dump())

    db.add(pricing)
    db.commit()
    db.refresh(pricing)

    return pricing


@router.get("/", response_model=list[ResortPricingResponse])
def get_pricing_slabs(db: Session = Depends(get_db)):
    return db.query(ResortPricing).order_by(
        ResortPricing.min_guests
    ).all()


@router.put("/{pricing_id}", response_model=ResortPricingResponse)
def update_pricing(
    pricing_id: int,
    pricing_data: ResortPricingUpdate,
    db: Session = Depends(get_db)
):
    pricing = db.query(ResortPricing).filter(
        ResortPricing.pricing_id == pricing_id
    ).first()

    if not pricing:
        raise HTTPException(
            status_code=404,
            detail="Pricing slab not found"
        )

    validate_guest_range(
        pricing_data.min_guests,
        pricing_data.max_guests
    )

    check_overlapping_slab(
        db,
        pricing_data.min_guests,
        pricing_data.max_guests,
        exclude_id=pricing_id
    )

    for key, value in pricing_data.model_dump().items():
        setattr(pricing, key, value)

    db.commit()
    db.refresh(pricing)

    return pricing


@router.delete("/{pricing_id}")
def delete_pricing(
    pricing_id: int,
    db: Session = Depends(get_db)
):
    pricing = db.query(ResortPricing).filter(
        ResortPricing.pricing_id == pricing_id
    ).first()

    if not pricing:
        raise HTTPException(
            status_code=404,
            detail="Pricing slab not found"
        )

    db.delete(pricing)
    db.commit()

    return {"message": "Pricing slab deleted successfully"}
