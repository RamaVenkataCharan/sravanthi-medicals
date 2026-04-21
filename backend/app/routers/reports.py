from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import SessionLocal
from app.models.bill import Bill
from app.models.bill_item import BillItem
from app.models.batch import Batch
from app.models.medicine import Medicine
from datetime import date, timedelta

router = APIRouter(prefix="/api/reports", tags=["Reports"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/daily-sales")
def get_daily_sales(db: Session = Depends(get_db)):
    today = date.today()
    sales = db.query(
        func.count(Bill.id).label("total_bills"),
        func.sum(Bill.total_amount).label("total_revenue")
    ).filter(Bill.date == today).first()
    
    return {
        "date": today,
        "total_bills": sales.total_bills or 0,
        "total_revenue": sales.total_revenue or 0.0
    }

@router.get("/top-medicines")
def get_top_medicines(limit: int = 5, db: Session = Depends(get_db)):
    top = db.query(
        Batch.medicine_id,
        Medicine.name,
        func.sum(BillItem.quantity).label("total_sold")
    ).join(BillItem, Batch.id == BillItem.batch_id)\
     .join(Medicine, Medicine.id == Batch.medicine_id)\
     .group_by(Batch.medicine_id, Medicine.name)\
     .order_by(func.sum(BillItem.quantity).desc())\
     .limit(limit).all()
     
    return [{"medicine_id": t.medicine_id, "name": t.name, "total_sold": t.total_sold} for t in top]

@router.get("/low-stock")
def get_low_stock(threshold: int = 10, db: Session = Depends(get_db)):
    low_batches = db.query(
        Batch.id, Batch.batch_no, Batch.stock_quantity, Medicine.name
    ).join(Medicine, Medicine.id == Batch.medicine_id)\
    .filter(Batch.stock_quantity < threshold).all()
    
    return [{"batch_id": b.id, "batch_no": b.batch_no, "stock_quantity": b.stock_quantity, "medicine_name": b.name} for b in low_batches]

@router.get("/expiry")
def get_expiry_report(days: int = 30, db: Session = Depends(get_db)):
    target_date = date.today() + timedelta(days=days)
    expiring = db.query(
        Batch.id, Batch.batch_no, Batch.expiry_date, Batch.stock_quantity, Medicine.name
    ).join(Medicine, Medicine.id == Batch.medicine_id)\
    .filter(
        Batch.expiry_date <= target_date,
        Batch.stock_quantity > 0
    ).all()
    
    return [{"batch_id": b.id, "batch_no": b.batch_no, "expiry_date": b.expiry_date, "stock_quantity": b.stock_quantity, "medicine_name": b.name} for b in expiring]
