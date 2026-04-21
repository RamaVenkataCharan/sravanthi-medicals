from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

class Medicine(Base):
    __tablename__ = "medicines"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    manufacturer = Column(String)
    gst_percentage = Column(Float, default=5.0)
    
    batches = relationship("Batch", back_populates="medicine", cascade="all, delete-orphan")
