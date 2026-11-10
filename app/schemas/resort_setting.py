
from pydantic import BaseModel, ConfigDict
from typing import Optional


class ResortSettingCreate(BaseModel):
    resort_name: str
    legal_name: Optional[str] = None
    gstin: Optional[str] = None

    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    state_code: Optional[str] = None
    pincode: Optional[str] = None

    phone: Optional[str] = None
    email: Optional[str] = None

    logo_path: Optional[str] = None
    signature_path: Optional[str] = None

    thank_you_message: Optional[str] = None


class ResortSettingResponse(ResortSettingCreate):
    setting_id: int

    model_config = ConfigDict(from_attributes=True)
