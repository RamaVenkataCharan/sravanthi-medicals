from sqlalchemy.orm import Session
from app.models.audit_log import AuditLog

def log_action(db: Session, action: str, user_name: str, details: str = None):
    """
    Helper to log important application events.
    """
    log_entry = AuditLog(
        action=action,
        user_name=user_name,
        details=details
    )
    db.add(log_entry)
    db.commit()
    return log_entry
