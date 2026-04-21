from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.core.database import SessionLocal, DATABASE_URL
from app.models.store_settings import StoreSettings
from app.utils.audit import log_action
import shutil
import os
from datetime import datetime

router = APIRouter(prefix="/api/settings", tags=["Settings"])

class SettingsUpdate(BaseModel):
    store_name: str
    address: str
    gst_number: str
    printer_config: str

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def get_settings(db: Session = Depends(get_db)):
    settings = db.query(StoreSettings).first()
    if not settings:
        settings = StoreSettings()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.put("/")
def update_settings(settings_in: SettingsUpdate, db: Session = Depends(get_db)):
    settings = db.query(StoreSettings).first()
    if not settings:
        settings = StoreSettings()
        db.add(settings)
    
    settings.store_name = settings_in.store_name
    settings.address = settings_in.address
    settings.gst_number = settings_in.gst_number
    settings.printer_config = settings_in.printer_config
    
    log_action(db, "UPDATE_SETTINGS", "admin", "Updated store settings")
    db.commit()
    db.refresh(settings)
    return settings

@router.post("/backup")
def trigger_backup(db: Session = Depends(get_db)):
    if "sqlite" in DATABASE_URL:
        db_path = DATABASE_URL.replace("sqlite:///", "")
        if db_path.startswith("./"):
            db_path = db_path[2:]
            
        if not os.path.exists(db_path):
            raise HTTPException(status_code=404, detail="Database file not found")
            
        backup_dir = "backups"
        os.makedirs(backup_dir, exist_ok=True)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = os.path.join(backup_dir, f"pharmacy_backup_{timestamp}.db")
        
        shutil.copy2(db_path, backup_path)
        log_action(db, "SYSTEM_BACKUP", "admin", f"Created backup at {backup_path}")
        return {"message": "Backup created successfully", "path": backup_path}
    else:
        raise HTTPException(status_code=400, detail="Backup only supported for SQLite in this version")
