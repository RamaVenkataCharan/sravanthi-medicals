from sqlalchemy import Column, Integer, String
from app.core.database import Base

class StoreSettings(Base):
    __tablename__ = "store_settings"

    id = Column(Integer, primary_key=True, index=True)
    store_name = Column(String, default="Sravanthi Medicals", nullable=False)
    address = Column(String, default="Main Road, City", nullable=False)
    gst_number = Column(String, default="", nullable=True)
    printer_config = Column(String, default="thermal_80mm", nullable=True)
