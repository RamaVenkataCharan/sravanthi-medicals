from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models.bill import Bill
from app.models.bill_item import BillItem
from app.models.batch import Batch
from app.models.counter import Counter
from app.schemas.bill_schema import BillCreate, BillOut
from app.utils.audit import log_action
from datetime import date
import uuid

router = APIRouter(prefix="/api/bills", tags=["Bills"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/", response_model=BillOut)
def create_bill(bill_in: BillCreate, db: Session = Depends(get_db)):
    if not bill_in.items:
        raise HTTPException(status_code=400, detail="Bill must have items")

    try:
        total_amount = 0.0
        subtotal = 0.0
        gst_total = 0.0
        bill_items = []
        
        # Sort items by batch_id to prevent deadlocks when locking multiple rows
        sorted_items = sorted(bill_in.items, key=lambda x: x.batch_id)
        
        # Pre-check logic for all items
        for item in sorted_items:
            # Row locking: lock the batch row for concurrent update safety
            batch = db.query(Batch).filter(Batch.id == item.batch_id).with_for_update().first()
            if not batch:
                raise HTTPException(status_code=404, detail=f"Batch {item.batch_id} not found")
            
            medicine = batch.medicine
            gst_pct = medicine.gst_percentage
            
            # Rule 1: No negative stock
            if batch.stock_quantity < item.quantity:
                raise HTTPException(status_code=400, detail=f"Insufficient stock for batch {batch.batch_no}")
                
            # Rule 2: No expired medicine
            if batch.expiry_date < date.today():
                raise HTTPException(status_code=400, detail=f"Batch {batch.batch_no} is expired")

            # GST Calculations
            unit_base_price = batch.mrp / (1 + gst_pct / 100)
            unit_gst_amount = batch.mrp - unit_base_price
            
            row_base = unit_base_price * item.quantity
            row_gst = unit_gst_amount * item.quantity
            row_total = batch.mrp * item.quantity

            subtotal += row_base
            gst_total += row_gst
            total_amount += row_total
            
            bill_items.append({
                "batch": batch,
                "quantity": item.quantity,
                "price": batch.mrp,
                "base_price": unit_base_price,
                "gst_percentage": gst_pct,
                "gst_amount": row_gst,
                "total": row_total
            })

        # Generate unique sequential bill number
        counter = db.query(Counter).filter(Counter.name == "bill_no").with_for_update().first()
        if not counter:
            counter = Counter(name="bill_no", value=1000)
            db.add(counter)
        
        counter.value += 1
        serial_no = f"INV-{counter.value}"

        # Create bill
        db_bill = Bill(
            serial_no=serial_no,
            customer_name=bill_in.customer_name,
            doctor_name=bill_in.doctor_name,
            payment_mode=bill_in.payment_mode,
            subtotal=subtotal,
            gst_total=gst_total,
            total_amount=total_amount
        )
        db.add(db_bill)
        db.flush() # Flush to get the ID without committing
        
        # Reduce stock and save items
        for item_data in bill_items:
            batch = item_data["batch"]
            batch.stock_quantity -= item_data["quantity"] # Reduce stock
            
            db_bill_item = BillItem(
                bill_id=db_bill.id,
                batch_id=batch.id,
                quantity=item_data["quantity"],
                price=item_data["price"],
                base_price=item_data["base_price"],
                gst_percentage=item_data["gst_percentage"],
                gst_amount=item_data["gst_amount"],
                total=item_data["total"]
            )
            db.add(db_bill_item)
        
        # Log action
        log_action(db, "CREATE_BILL", "system_user", f"Created bill {serial_no} for Rs.{total_amount:.2f}")

        db.commit()
        db.refresh(db_bill)
        
        return db_bill

    except HTTPException:
        db.rollback() # Important: rollback transaction if our explicit error hits
        raise
    except Exception as e:
        db.rollback() # Rollback on unhandled crashes
        raise HTTPException(status_code=500, detail=f"Billing transaction failed: {str(e)}")

@router.get("/", response_model=list[BillOut])
def get_bills(db: Session = Depends(get_db)):
    return db.query(Bill).all()
