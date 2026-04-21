from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.batch import Batch
from app.models.medicine import Medicine
from app.schemas.batch_schema import BatchCreate, BatchOut

router = APIRouter(prefix="/api/batches", tags=["Batches"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=BatchOut)
def create_batch(batch: BatchCreate, db: Session = Depends(get_db)):
    db_medicine = db.query(Medicine).filter(Medicine.id == batch.medicine_id).first()
    if not db_medicine:
        raise HTTPException(status_code=404, detail="Medicine not found")
    
    db_batch = Batch(**batch.dict())
    db.add(db_batch)
    db.commit()
    db.refresh(db_batch)
    return db_batch

@router.get("/", response_model=list[BatchOut])
def get_batches(medicine_id: int = None, db: Session = Depends(get_db)):
    query = db.query(Batch)
    if medicine_id:
        query = query.filter(Batch.medicine_id == medicine_id)
    return query.all()
