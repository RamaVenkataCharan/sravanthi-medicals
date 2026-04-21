from pydantic import BaseModel, Field
from datetime import date
from typing import List, Optional

class BillItemCreate(BaseModel):
    batch_id: int
    quantity: int = Field(gt=0)

class BillCreate(BaseModel):
    customer_name: Optional[str] = None
    doctor_name: Optional[str] = None
    payment_mode: str = "Cash"
    items: List[BillItemCreate]

class BillItemOut(BaseModel):
    id: int
    batch_id: int
    name: str = "Unknown"
    batch_no: str = "Unknown"
    quantity: int
    price: float
    base_price: float
    gst_percentage: float
    gst_amount: float
    total: float

    class Config:
        from_attributes = True

class BillOut(BaseModel):
    id: int
    serial_no: str
    date: date
    customer_name: Optional[str] = None
    doctor_name: Optional[str] = None
    payment_mode: str
    subtotal: float
    gst_total: float
    total_amount: float
    items: List[BillItemOut]

    class Config:
        from_attributes = True
