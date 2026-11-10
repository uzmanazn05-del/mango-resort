from fastapi.staticfiles import StaticFiles
from pathlib import Path
from fastapi import FastAPI, HTTPException
from app.database import test_db_connection, Base, engine
from app.routes.customers import router as customer_router
from app.models.room import Room
from app.routes.rooms import router as room_router
from app.models.room_type import RoomType
from app.models.booking import Booking
from app.routes.bookings import router as booking_router
from fastapi.middleware.cors import CORSMiddleware
from app.routes.room_types import router as room_type_router
from app.routes.payments import router as payment_router
from app.routes.resort_pricing import router as resort_pricing_router
from app.routes.invoices import router as invoice_router
from app.routes.dashboard import router as dashboard_router

from app.models.invoice import Invoice
from app.models.invoice_items import InvoiceItem
from app.models.payment import Payment
from app.models.resort_setting import ResortSetting
from app.models.service import Service
from app.models.booking_service import BookingService
from app.models.resort_pricing import ResortPricing
from app.routes.services import router as service_router
from app.routes.booking_services import router as booking_service_router
from app.routes.resort_settings import router as resort_settings_router


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Resort Management API",
    description="Backend API for Resort Management and Billing",
    version="1.0.0"
)
UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

app.mount(
    "/uploads",
    StaticFiles(directory=str(UPLOAD_DIR)),
    name="uploads"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://resort-management-three.vercel.app"
],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def home():
    return {"message": "Resort Management API is running!"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/db-check")
def database_check():
    try:
        result = test_db_connection()
        return {
            "status": "connected",
            "database": "PostgreSQL",
            "test_result": result
        }
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Database connection failed. Check backend logs."
        )


# Register customer API routes
app.include_router(customer_router)
app.include_router(room_router)
app.include_router(room_type_router)
app.include_router(booking_router)
app.include_router(invoice_router)
app.include_router(payment_router)
app.include_router(resort_pricing_router)
app.include_router(service_router)
app.include_router(booking_service_router)
app.include_router(resort_settings_router)
app.include_router(dashboard_router)
