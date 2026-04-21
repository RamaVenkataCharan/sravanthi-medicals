from sqlalchemy import Column, Integer, String, DateTime
from app.core.database import Base
from datetime import datetime

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String, index=True, nullable=False)
    user_name = Column(String, index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    details = Column(String, nullable=True)
