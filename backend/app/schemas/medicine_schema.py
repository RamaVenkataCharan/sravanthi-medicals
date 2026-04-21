from pydantic import BaseModel, Field

from app.schemas.batch_schema import BatchOut
from typing import List

class MedicineBase(BaseModel):
    name: str = Field(min_length=2)
    manufacturer: str = Field(min_length=2)
    gst_percentage: float = 5.0

class MedicineCreate(MedicineBase):
    pass

class MedicineOut(MedicineBase):
    id: int
    batches: List[BatchOut] = []

    class Config:
        from_attributes = True
