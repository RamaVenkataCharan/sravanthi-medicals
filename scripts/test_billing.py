import os
import sys
from datetime import date, timedelta
from fastapi.testclient import TestClient

sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend"))

from app.main import app
from app.core.database import SessionLocal, engine, Base
from app.models.medicine import Medicine
from app.models.batch import Batch

client = TestClient(app)

def setup_test_data():
    db = SessionLocal()
    # Reset
    db.query(Batch).delete()
    db.query(Medicine).delete()
    db.commit()

    # Create Paracetamol
    med1 = Medicine(name="Paracetamol", manufacturer="Cipla")
    db.add(med1)
    db.flush()

    # Batch A (Normal)
    batch_a = Batch(
        medicine_id=med1.id,
        batch_no="BATCH-A",
        expiry_date=date.today() + timedelta(days=365),
        mrp=20.0,
        stock_quantity=5
    )
    # Batch B (Expired)
    batch_b = Batch(
        medicine_id=med1.id,
        batch_no="BATCH-B-EXP",
        expiry_date=date.today() - timedelta(days=1),
        mrp=18.0,
        stock_quantity=100
    )
    db.add(batch_a)
    db.add(batch_b)
    
    # Create Azithromycin
    med2 = Medicine(name="Azithromycin", manufacturer="Pfizer")
    db.add(med2)
    db.flush()
    batch_c = Batch(
        medicine_id=med2.id,
        batch_no="BATCH-C",
        expiry_date=date.today() + timedelta(days=365),
        mrp=120.0,
        stock_quantity=50
    )
    db.add(batch_c)
    db.commit()
    
    return {
        "batch_a": batch_a.id,
        "batch_b": batch_b.id,
        "batch_c": batch_c.id
    }

def run_tests():
    print("--- STARTING CRITICAL TEST SUITE ---")
    data = setup_test_data()
    
    # TEST 1: Normal Billing Flow
    print("\n[TEST 1] Normal Billing Flow")
    res1 = client.post("/api/bills/", json={
        "items": [{"batch_id": data["batch_a"], "quantity": 2}]
    })
    assert res1.status_code == 200, res1.text
    print("✅ Bill created successfully")
    
    # Verify stock reduced
    db = SessionLocal()
    batch_a = db.query(Batch).filter(Batch.id == data["batch_a"]).first()
    assert batch_a.stock_quantity == 3
    print("✅ Stock reduced correctly (5 -> 3)")
    db.close()
    
    # TEST 2: Stock Validation
    print("\n[TEST 2] Stock Validation (Sell 10, Have 3)")
    res2 = client.post("/api/bills/", json={
        "items": [{"batch_id": data["batch_a"], "quantity": 10}]
    })
    assert res2.status_code == 400
    assert "Insufficient stock" in res2.json()["detail"]
    print("✅ Successfully blocked insufficient stock")
    
    # TEST 3: Expiry Validation
    print("\n[TEST 3] Expiry Validation")
    res3 = client.post("/api/bills/", json={
        "items": [{"batch_id": data["batch_b"], "quantity": 2}]
    })
    assert res3.status_code == 400
    assert "expired" in res3.json()["detail"]
    print("✅ Successfully blocked expired medicine")
    
    # TEST 4: Multi-Batch Selection
    print("\n[TEST 4] Multi-Batch Selection (Price check)")
    # Wait, Batch B is expired so we can't test price on it. Let's make Batch D for this.
    db = SessionLocal()
    med1 = db.query(Medicine).filter(Medicine.name == "Paracetamol").first()
    batch_d = Batch(medicine_id=med1.id, batch_no="BATCH-D", expiry_date=date.today() + timedelta(days=100), mrp=18.0, stock_quantity=100)
    db.add(batch_d)
    db.commit()
    batch_d_id = batch_d.id
    db.close()
    
    res4 = client.post("/api/bills/", json={
        "items": [{"batch_id": batch_d_id, "quantity": 1}]
    })
    assert res4.status_code == 200
    assert res4.json()["total_amount"] == 18.0
    print("✅ Correct batch price applied (₹18)")

    # TEST 5: Search Accuracy (Fuzzy)
    print("\n[TEST 5] Search Accuracy (Fuzzy: 'paracitamol')")
    res5 = client.get("/api/medicines/pro-search?q=paracitamol")
    assert res5.status_code == 200
    assert len(res5.json()) > 0
    assert "Paracetamol" in res5.json()[0]["name"]
    print("✅ Found Paracetamol despite typo")

    # TEST 6: Bill Total Calculation
    print("\n[TEST 6] Bill Total Calculation (2 Para @ 20 + 1 Azithro @ 120)")
    # Note: Para Batch A mrp=20.0, Azithro Batch C mrp=120.0
    res6 = client.post("/api/bills/", json={
         "items": [
             {"batch_id": data["batch_a"], "quantity": 2}, # 40
             {"batch_id": data["batch_c"], "quantity": 1}  # 120
         ]
    })
    assert res6.status_code == 200
    total = res6.json()["total_amount"]
    assert total == 160.0
    print(f"✅ Total correctly calculated: ₹{total}")

    # TEST 8: Empty Search
    print("\n[TEST 8] Empty Search")
    res8 = client.get("/api/medicines/search?q=")
    assert res8.status_code == 200
    print("✅ Empty search handled gracefully without crashing")

    # EDGE CASES
    print("\n[EDGE CASES] Validating negative and zero quantities")
    res_zero = client.post("/api/bills/", json={"items": [{"batch_id": data["batch_a"], "quantity": 0}]})
    assert res_zero.status_code == 422 # Pydantic validation error
    print("✅ Blocked zero quantity")
    
    res_neg = client.post("/api/bills/", json={"items": [{"batch_id": data["batch_a"], "quantity": -5}]})
    assert res_neg.status_code == 422
    print("✅ Blocked negative quantity")
    
    res_invalid = client.post("/api/bills/", json={"items": [{"batch_id": 9999, "quantity": 1}]})
    assert res_invalid.status_code == 404
    print("✅ Blocked invalid batch ID")

    print("\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🎉")

if __name__ == "__main__":
    run_tests()
