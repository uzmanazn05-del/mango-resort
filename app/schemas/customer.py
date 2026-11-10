
from pydantic import BaseModel, ConfigDict, Field, EmailStr
from typing import Optional


# Data received from React
class CustomerCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    phone: str = Field(min_length=10, max_length=15)
    email: Optional[EmailStr] = None
    address: Optional[str] = None


# Data returned to React
class CustomerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    customer_id: int
    full_name: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
