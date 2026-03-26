from sqlalchemy import Column, Integer, String, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import date

class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, index=True)
    serial_no = Column(String, unique=True, index=True, nullable=False)
    date = Column(Date, default=date.today, nullable=False)
    customer_name = Column(String, nullable=True) 
    doctor_name = Column(String, nullable=True) 
    payment_mode = Column(String, default="Cash", nullable=False)
    subtotal = Column(Float, default=0.0, nullable=False)
    gst_total = Column(Float, default=0.0, nullable=False)
    total_amount = Column(Float, default=0.0, nullable=False)

    items = relationship("BillItem", back_populates="bill", cascade="all, delete-orphan")
