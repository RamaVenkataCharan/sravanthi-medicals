from sqlalchemy import Column, Integer, String
from app.core.database import Base

class Counter(Base):
    __tablename__ = "counters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    value = Column(Integer, default=0, nullable=False)
