"""
Seed Data Script for Sravanthi Medicals — Pharmacy Billing & Inventory System
==============================================================================
Populates the database with realistic Indian pharmacy data:
  - 40 Medicines with GST rates
  - ~100 Batches (2-3 per medicine)
  - 25 Bills with 1-3 items each
  - Bill Items with correct GST calculations
  - Stock deductions applied to batches

Safe to re-run: checks for existing data before inserting.
"""

import sys
import os
import random
from datetime import date, timedelta

# Ensure the backend directory is importable
BACKEND_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "project", "backend")
if not os.path.isdir(BACKEND_DIR):
    # If run from inside the project directory
    BACKEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "backend")
    BACKEND_DIR = os.path.normpath(BACKEND_DIR)

sys.path.insert(0, BACKEND_DIR)
os.chdir(BACKEND_DIR)  # so SQLite path resolves correctly

from app.core.database import SessionLocal, engine, Base
from app.models.medicine import Medicine
from app.models.batch import Batch
from app.models.bill import Bill
from app.models.bill_item import BillItem
from app.models.counter import Counter
from app.models.audit_log import AuditLog
from app.models.store_settings import StoreSettings
from app.models.user import User

# Parse --reset flag
RESET_DB = "--reset" in sys.argv

# ---------------------------------------------------------------------------
# STEP 1 — MEDICINE DATA (40 realistic Indian pharmacy medicines)
# ---------------------------------------------------------------------------
MEDICINES = [
    # (name, manufacturer, gst_percentage)
    ("Dolo 650", "Micro Labs", 12),
    ("Crocin 500mg", "GSK", 12),
    ("Paracetamol 500mg", "Cipla", 5),
    ("Azithromycin 500mg", "Sun Pharma", 12),
    ("Amoxicillin 250mg", "Pfizer", 12),
    ("Ibuprofen 400mg", "Abbott", 12),
    ("Cetirizine 10mg", "Cipla", 12),
    ("Pantoprazole 40mg", "Alkem", 12),
    ("Pan D", "Alkem", 12),
    ("Shelcal 500mg", "Torrent Pharma", 12),
    ("Metformin 500mg", "USV", 5),
    ("Atorvastatin 10mg", "Lupin", 12),
    ("Amlodipine 5mg", "Cipla", 12),
    ("Losartan 50mg", "Torrent Pharma", 12),
    ("Omeprazole 20mg", "Dr. Reddy's", 12),
    ("Ranitidine 150mg", "J.B. Chemicals", 12),
    ("Montelukast 10mg", "Sun Pharma", 12),
    ("Levocetirizine 5mg", "Glenmark", 12),
    ("Azee 500", "Cipla", 12),
    ("Augmentin 625 Duo", "GSK", 12),
    ("Cefixime 200mg", "Mankind Pharma", 12),
    ("Ciprofloxacin 500mg", "Ranbaxy", 12),
    ("Ofloxacin 200mg", "Cipla", 12),
    ("Metronidazole 400mg", "Abbott", 5),
    ("Diclofenac 50mg", "Novartis", 12),
    ("Aceclofenac 100mg", "IPCA Labs", 12),
    ("Aspirin 75mg", "Bayer", 5),
    ("Clopidogrel 75mg", "Torrent Pharma", 12),
    ("Ecosprin 75mg", "USV", 5),
    ("Vitamin C 500mg", "Limcee", 5),
    ("B-Complex Forte", "Abbott", 5),
    ("Becosules Capsule", "Pfizer", 5),
    ("Calcium + Vitamin D3", "Shelcal", 5),
    ("Liv 52 Tablets", "Himalaya", 5),
    ("Gelusil MPS", "Pfizer", 5),
    ("Digene Tablets", "Abbott", 5),
    ("ORS Powder (Orange)", "FDC Ltd", 5),
    ("Deriphyllin Retard 150mg", "Franco Indian", 12),
    ("Sinarest New", "Centaur Pharma", 12),
    ("Vicks Cough Drops", "P&G", 5),
]

# Realistic MRP ranges for each medicine (min, max)
MRP_RANGES = [
    (30, 45),    # Dolo 650
    (25, 35),    # Crocin 500mg
    (10, 18),    # Paracetamol 500mg
    (80, 120),   # Azithromycin 500mg
    (40, 65),    # Amoxicillin 250mg
    (25, 40),    # Ibuprofen 400mg
    (15, 30),    # Cetirizine 10mg
    (60, 95),    # Pantoprazole 40mg
    (85, 130),   # Pan D
    (120, 180),  # Shelcal 500mg
    (15, 30),    # Metformin 500mg
    (50, 90),    # Atorvastatin 10mg
    (20, 45),    # Amlodipine 5mg
    (55, 85),    # Losartan 50mg
    (30, 60),    # Omeprazole 20mg
    (20, 40),    # Ranitidine 150mg
    (95, 160),   # Montelukast 10mg
    (40, 70),    # Levocetirizine 5mg
    (75, 110),   # Azee 500
    (150, 250),  # Augmentin 625 Duo
    (60, 100),   # Cefixime 200mg
    (30, 55),    # Ciprofloxacin 500mg
    (35, 60),    # Ofloxacin 200mg
    (12, 25),    # Metronidazole 400mg
    (15, 30),    # Diclofenac 50mg
    (45, 80),    # Aceclofenac 100mg
    (10, 20),    # Aspirin 75mg
    (60, 100),   # Clopidogrel 75mg
    (25, 45),    # Ecosprin 75mg
    (20, 35),    # Vitamin C 500mg
    (25, 40),    # B-Complex Forte
    (25, 40),    # Becosules Capsule
    (100, 170),  # Calcium + Vitamin D3
    (90, 150),   # Liv 52 Tablets
    (40, 70),    # Gelusil MPS
    (30, 55),    # Digene Tablets
    (18, 30),    # ORS Powder
    (50, 85),    # Deriphyllin Retard
    (40, 65),    # Sinarest New
    (15, 25),    # Vicks Cough Drops
]

# ---------------------------------------------------------------------------
# STEP 3 & 4 — CUSTOMER & DOCTOR NAMES (used as strings in Bill)
# ---------------------------------------------------------------------------
CUSTOMER_NAMES = [
    "Rajesh Kumar",
    "Priya Sharma",
    "Venkata Rao",
    "Lakshmi Devi",
    "Suresh Reddy",
    "Anita Patel",
    "Ramesh Gupta",
    "Sunita Iyer",
    "Vijay Krishnan",
    "Kavitha Nair",
    "Mohan Das",
    "Sravanthi Medicals (Walk-in)",
]

DOCTOR_NAMES = [
    "Dr. Ramesh Babu",
    "Dr. Lakshmi Prasad",
    "Dr. Sunil Kumar",
    "Dr. Anjali Reddy",
    "Dr. Venkat Rao",
    "Dr. Priya Menon",
    "Dr. Srinivas Gupta",
    "Dr. Kavitha Sharma",
]

PAYMENT_MODES = ["Cash", "UPI", "Card"]


def round2(val: float) -> float:
    """Round to 2 decimal places."""
    return round(val, 2)


def seed():
    # If --reset flag, drop all tables and recreate from models
    if RESET_DB:
        print("[RESET] Dropping all tables and recreating from current models...")
        Base.metadata.drop_all(bind=engine)
        Base.metadata.create_all(bind=engine)
        print("[RESET] Tables recreated successfully.")
    else:
        # Ensure tables exist (won't alter existing columns)
        Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # ==================================================================
        # SAFETY CHECK — skip if data already exists
        # ==================================================================
        existing_med_count = db.query(Medicine).count()
        if existing_med_count >= 30:
            print(f"[WARNING] Database already contains {existing_med_count} medicines. Skipping seed to avoid duplicates.")
            print("   To re-seed, clear the database first.")
            return

        random.seed(42)  # Reproducible data

        # ==================================================================
        # STEP 1 — INSERT MEDICINES
        # ==================================================================
        medicine_objects = []
        med_count = 0
        for name, manufacturer, gst in MEDICINES:
            existing = db.query(Medicine).filter(Medicine.name == name).first()
            if existing:
                medicine_objects.append(existing)
                continue
            med = Medicine(name=name, manufacturer=manufacturer, gst_percentage=float(gst))
            db.add(med)
            medicine_objects.append(med)
            med_count += 1

        db.flush()  # Get IDs assigned
        print(f"[OK] Inserted {med_count} medicines (skipped {len(MEDICINES) - med_count} existing)")

        # ==================================================================
        # STEP 2 — INSERT BATCHES (2-3 per medicine)
        # ==================================================================
        batch_objects = []  # flat list of all batches for bill generation
        batch_count = 0
        today = date.today()

        for idx, med in enumerate(medicine_objects):
            num_batches = random.choice([2, 2, 3])  # Weighted toward 2
            mrp_min, mrp_max = MRP_RANGES[idx]

            for b in range(num_batches):
                batch_letter = chr(65 + b)  # A, B, C
                batch_no = f"B{idx+1:02d}{batch_letter}"

                # Check if batch already exists
                existing_batch = db.query(Batch).filter(Batch.batch_no == batch_no).first()
                if existing_batch:
                    batch_objects.append(existing_batch)
                    continue

                # Expiry: 6 months to 2 years from now
                expiry_days = random.randint(180, 730)
                expiry_date = today + timedelta(days=expiry_days)

                # MRP — slight variation per batch
                mrp = round2(random.uniform(mrp_min, mrp_max))

                # Stock: 50–200
                stock = random.randint(50, 200)

                batch = Batch(
                    medicine_id=med.id,
                    batch_no=batch_no,
                    expiry_date=expiry_date,
                    mrp=mrp,
                    stock_quantity=stock,
                )
                db.add(batch)
                batch_objects.append(batch)
                batch_count += 1

        db.flush()
        print(f"[OK] Inserted {batch_count} batches")

        # ==================================================================
        # STEP 5 & 6 — GENERATE BILLS WITH ITEMS
        # ==================================================================
        NUM_BILLS = 25

        # Setup counter for serial_no
        counter = db.query(Counter).filter(Counter.name == "bill_no").first()
        if not counter:
            counter = Counter(name="bill_no", value=1000)
            db.add(counter)
            db.flush()

        # Filter batches that have enough stock (at least 5)
        available_batches = [b for b in batch_objects if b.stock_quantity >= 5]

        bill_count = 0
        item_count = 0

        for bill_idx in range(NUM_BILLS):
            if not available_batches:
                print("[WARNING] Ran out of available batches, stopping bill generation.")
                break

            # Pick random customer, doctor, payment mode
            customer_name = random.choice(CUSTOMER_NAMES)
            doctor_name = random.choice(DOCTOR_NAMES)
            payment_mode = random.choices(PAYMENT_MODES, weights=[50, 35, 15])[0]

            # Bill date: spread over last 30 days
            bill_date = today - timedelta(days=random.randint(0, 30))

            # Generate serial_no
            counter.value += 1
            serial_no = f"INV-{counter.value}"

            # Pick 1–3 items
            num_items = random.choice([1, 2, 2, 3])
            selected_batches = random.sample(
                available_batches, min(num_items, len(available_batches))
            )

            subtotal = 0.0
            gst_total = 0.0
            total_amount = 0.0
            bill_items_data = []

            for batch in selected_batches:
                quantity = random.randint(1, 5)

                # Ensure we don't exceed stock
                if quantity > batch.stock_quantity:
                    quantity = max(1, batch.stock_quantity - 1)

                gst_pct = batch.medicine.gst_percentage

                # GST calculations (matching bills.py logic)
                unit_base_price = round2(batch.mrp / (1 + gst_pct / 100))
                unit_gst_amount = round2(batch.mrp - unit_base_price)

                row_base = round2(unit_base_price * quantity)
                row_gst = round2(unit_gst_amount * quantity)
                row_total = round2(batch.mrp * quantity)

                subtotal += row_base
                gst_total += row_gst
                total_amount += row_total

                bill_items_data.append({
                    "batch": batch,
                    "quantity": quantity,
                    "price": batch.mrp,
                    "base_price": unit_base_price,
                    "gst_percentage": gst_pct,
                    "gst_amount": row_gst,
                    "total": row_total,
                })

            # Create the bill
            db_bill = Bill(
                serial_no=serial_no,
                date=bill_date,
                customer_name=customer_name,
                doctor_name=doctor_name,
                payment_mode=payment_mode,
                subtotal=round2(subtotal),
                gst_total=round2(gst_total),
                total_amount=round2(total_amount),
            )
            db.add(db_bill)
            db.flush()

            # Create bill items & deduct stock
            for item_data in bill_items_data:
                batch = item_data["batch"]

                bill_item = BillItem(
                    bill_id=db_bill.id,
                    batch_id=batch.id,
                    quantity=item_data["quantity"],
                    price=item_data["price"],
                    base_price=item_data["base_price"],
                    gst_percentage=item_data["gst_percentage"],
                    gst_amount=item_data["gst_amount"],
                    total=item_data["total"],
                )
                db.add(bill_item)

                # STEP 7 — STOCK UPDATE
                batch.stock_quantity -= item_data["quantity"]
                item_count += 1

            # Refresh available batches (remove those with low stock)
            available_batches = [b for b in batch_objects if b.stock_quantity >= 5]

            bill_count += 1

        # ==================================================================
        # COMMIT
        # ==================================================================
        db.commit()

        # ==================================================================
        # PRINT SUMMARY
        # ==================================================================
        final_med_count = db.query(Medicine).count()
        final_batch_count = db.query(Batch).count()
        final_bill_count = db.query(Bill).count()
        final_item_count = db.query(BillItem).count()

        print("\n" + "=" * 50)
        print("SEED DATA SUMMARY - Sravanthi Medicals")
        print("=" * 50)
        print(f"  Medicines:   {final_med_count}")
        print(f"  Batches:     {final_batch_count}")
        print(f"  Bills:       {final_bill_count}")
        print(f"  Bill Items:  {final_item_count}")
        print("=" * 50)
        print(f"\n  New this run -> {med_count} medicines, {batch_count} batches, {bill_count} bills, {item_count} bill items")
        print("\n[OK] Database seeded successfully!")
        print("   Your pharmacy is now ready with realistic data.")

    except Exception as e:
        db.rollback()
        print(f"\n[ERROR] Error seeding database: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    seed()
