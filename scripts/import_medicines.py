import os
import sys
import pandas as pd
from datetime import date, timedelta

# Add backend directory to path
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend"))

from app.core.database import SessionLocal, engine, Base
from app.models.medicine import Medicine
from app.models.batch import Batch

def main():
    Base.metadata.create_all(bind=engine)
    print("Ensured schema exists.")

    csv_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "sample_medicines.csv")
    if not os.path.exists(csv_path):
        print(f"CSV not found at {csv_path}!")
        return

    df = pd.read_csv(csv_path)
    db = SessionLocal()
    
    try:
        # Check if already imported to prevent duplicates
        if db.query(Medicine).first():
            print("Database already contains data. Deleting existing records...")
            db.query(Batch).delete()
            db.query(Medicine).delete()
            db.commit()

        for idx, row in df.iterrows():
            medName = str(row.get("medicine_name", row.get("name", "Unknown")))
            med = Medicine(
                name=medName,
                manufacturer=str(row.get("manufacturer", "Unknown"))
            )
            db.add(med)
            db.flush()
            
            price_val = row.get("price", row.get("mrp", 0.0))
            if pd.isna(price_val): price_val = 0.0
            
            batch = Batch(
                medicine_id=med.id,
                batch_no=f"BATT{med.id}-2026",
                expiry_date=date.today() + timedelta(days=365*2),
                mrp=float(price_val),
                stock_quantity=100
            )
            db.add(batch)

        db.commit()
        print(f"Data imported successfully! Inserted {len(df)} medicines with default batches.")
    except Exception as e:
        print(f"Error importing data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
