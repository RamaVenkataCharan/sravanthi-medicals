import sys
import os

# Ensure backend directory is in the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.models.medicine import Medicine

demo_medicines = [
    {"name": "Paracetamol 500mg", "manufacturer": "GSK", "price": 10.50},
    {"name": "Ibuprofen 400mg", "manufacturer": "Abbott", "price": 25.00},
    {"name": "Amoxicillin 250mg", "manufacturer": "Pfizer", "price": 45.00},
    {"name": "Cetirizine 10mg", "manufacturer": "Cipla", "price": 15.00},
    {"name": "Omeprazole 20mg", "manufacturer": "Dr. Reddy's", "price": 30.00},
    {"name": "Azithromycin 500mg", "manufacturer": "Sun Pharma", "price": 60.00},
    {"name": "Vitamin C 500mg", "manufacturer": "Mankind", "price": 20.00},
    {"name": "Aspirin 75mg", "manufacturer": "Bayer", "price": 12.00},
    {"name": "Metformin 500mg", "manufacturer": "USV", "price": 18.00},
    {"name": "Atorvastatin 10mg", "manufacturer": "Lupin", "price": 50.00},
    {"name": "Cough Syrup 100ml", "manufacturer": "Dabur", "price": 85.00},
    {"name": "Vicks VapoRub 50g", "manufacturer": "P&G", "price": 65.00},
    {"name": "B-Complex Vitamin capsules", "manufacturer": "Zydus", "price": 35.00},
    {"name": "ORS Powder (Apple flavor)", "manufacturer": "FDC Ltd", "price": 22.00},
    {"name": "Diclofenac Gel 30g", "manufacturer": "Novartis", "price": 110.00}
]

def seed():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        success_count = 0
        for med_data in demo_medicines:
            # Check if it already exists to avoid duplicates
            existing = db.query(Medicine).filter(Medicine.name == med_data["name"]).first()
            if not existing:
                med = Medicine(**med_data)
                db.add(med)
                print(f"Added {med_data['name']}")
                success_count += 1
            else:
                print(f"Skipped {med_data['name']} (already exists)")
        db.commit()
        print(f"\nSuccessfully imported {success_count} new demo medicines.")
    except Exception as e:
        print(f"Error seeding DB: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
