from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Batch(Base):
    __tablename__ = "batches"

    id = Column(Integer, primary_key=True, index=True)
    medicine_id = Column(Integer, ForeignKey("medicines.id"), nullable=False, index=True)
    batch_no = Column(String, index=True, nullable=False)
    expiry_date = Column(Date, index=True, nullable=False)
    mrp = Column(Float, nullable=False)
    stock_quantity = Column(Integer, default=0, nullable=False)

    medicine = relationship("Medicine", back_populates="batches")
    bill_items = relationship("BillItem", back_populates="batch")
