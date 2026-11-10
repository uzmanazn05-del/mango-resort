
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.resort_setting import ResortSetting
from app.schemas.resort_setting import (
    ResortSettingCreate,
    ResortSettingResponse,
)

router = APIRouter(
    prefix="/resort-settings",
    tags=["Resort Settings"]
)


@router.post("/", response_model=ResortSettingResponse)
def create_resort_settings(
    data: ResortSettingCreate,
    db: Session = Depends(get_db)
):
    existing = db.query(ResortSetting).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Resort settings already exist. Use PUT to update."
        )

    settings = ResortSetting(**data.model_dump())

    db.add(settings)
    db.commit()
    db.refresh(settings)

    return settings


@router.get("/", response_model=ResortSettingResponse)
def get_resort_settings(db: Session = Depends(get_db)):
    settings = db.query(ResortSetting).first()

    if not settings:
        raise HTTPException(
            status_code=404,
            detail="Resort settings not found"
        )

    return settings


@router.put("/", response_model=ResortSettingResponse)
def update_resort_settings(
    data: ResortSettingCreate,
    db: Session = Depends(get_db)
):
    settings = db.query(ResortSetting).first()

    if not settings:
        raise HTTPException(
            status_code=404,
            detail="Resort settings not found"
        )

    for field, value in data.model_dump().items():
        setattr(settings, field, value)

    db.commit()
    db.refresh(settings)

    return settings
