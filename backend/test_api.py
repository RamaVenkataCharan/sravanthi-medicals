from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "medicine-search-api"}

def test_get_settings():
    response = client.get("/api/settings/")
    assert response.status_code == 200
    assert "store_name" in response.json()

def test_reports_daily_sales():
    response = client.get("/api/reports/daily-sales")
    assert response.status_code == 200
    assert "total_revenue" in response.json()

def test_bill_validation_empty_items():
    # Creating a bill without items should throw 400
    response = client.post("/api/bills/", json={
        "customer_name": "Test",
        "doctor_name": "Dr. Test",
        "payment_mode": "Card",
        "items": []
    })
    assert response.status_code == 400
    assert response.json()["detail"] == "Bill must have items"

# Add more extensive tests here for testing stock levels, transaction concurrency etc.
