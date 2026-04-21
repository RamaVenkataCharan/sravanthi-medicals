from pydantic import BaseModel
from datetime import date

class BatchCreate(BaseModel):
    medicine_id: int
    batch_no: str
    expiry_date: date
    mrp: float
    stock_quantity: int

class BatchOut(BatchCreate):
    id: int

    class Config:
        from_attributes = True
