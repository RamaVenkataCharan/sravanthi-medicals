from sqlalchemy import Column, Integer, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class BillItem(Base):
    __tablename__ = "bill_items"

    id = Column(Integer, primary_key=True, index=True)
    bill_id = Column(Integer, ForeignKey("bills.id"), nullable=False)
    batch_id = Column(Integer, ForeignKey("batches.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    base_price = Column(Float, nullable=False)
    gst_percentage = Column(Float, nullable=False)
    gst_amount = Column(Float, nullable=False)
    total = Column(Float, nullable=False)

    bill = relationship("Bill", back_populates="items")
    batch = relationship("Batch", back_populates="bill_items")

    @property
    def name(self):
        return self.batch.medicine.name if self.batch and self.batch.medicine else "Unknown"

    @property
    def batch_no(self):
        return self.batch.batch_no if self.batch else "Unknown"
