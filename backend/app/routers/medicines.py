from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.medicine import Medicine
from app.schemas.medicine_schema import MedicineCreate, MedicineOut

router = APIRouter(prefix="/api/medicines", tags=["Medicines"])

# DB dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# CREATE medicine
@router.post("/", response_model=MedicineOut)
def create_medicine(med: MedicineCreate, db: Session = Depends(get_db)):
    db_med = Medicine(**med.dict())
    db.add(db_med)
    db.commit()
    db.refresh(db_med)
    return db_med

# GET all medicines
@router.get("/", response_model=list[MedicineOut])
def get_medicines(db: Session = Depends(get_db)):
    return db.query(Medicine).limit(100).all()

from app.services.search_service import hybrid_search

# SEARCH medicines
@router.get("/search", response_model=list[MedicineOut])
def search_medicines(q: str, db: Session = Depends(get_db)):
    return db.query(Medicine).filter(Medicine.name.ilike(f"%{q}%")).limit(10).all()

# PRO SEARCH medicines
@router.get("/pro-search", response_model=list[MedicineOut])
def pro_search(q: str, db: Session = Depends(get_db)):
    medicines = db.query(Medicine).limit(5000).all()
    return hybrid_search(q, medicines)
