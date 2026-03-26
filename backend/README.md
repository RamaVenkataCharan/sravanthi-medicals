# Medicine Database Integration — Setup Guide

## Project Structure

```
project/
├── backend/
│   ├── app/
│   │   └── main.py              # FastAPI search API
│   ├── scripts/
│   │   ├── clean_medicines.py   # Step 1: Clean Kaggle CSV
│   │   ├── import_medicines.py  # Step 2: Bulk import to Supabase
│   │   └── seed_sample_medicines.py  # One-click seed (200+ medicines)
│   ├── .env.example             # Copy to .env, fill in credentials
│   └── requirements.txt
├── supabase/
│   └── migrations/
│       ├── 20260314165056_create_pharmacy_schema.sql
│       └── 20260317000001_medicine_catalog.sql  # NEW
└── src/
    ├── hooks/
    │   └── useMedicineSearch.ts  # Debounced catalog search hook
    └── pages/
        └── Billing.tsx          # Upgraded with two-layer autocomplete
```

---

## Quick Start (No Kaggle needed)

### 1. Apply Database Migration

Run in Supabase SQL Editor ([Dashboard](https://supabase.com) → SQL Editor):

```sql
-- Copy-paste contents of:
-- supabase/migrations/20260317000001_medicine_catalog.sql
```

### 2. Seed Sample Medicines

```bash
cd project/backend

# Copy env template
copy .env.example .env
# Edit .env: add SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# Install Python dependencies
pip install -r requirements.txt

# Seed 200+ real Indian medicines
python scripts/seed_sample_medicines.py
```

### 3. Start FastAPI (Optional — auto-fallback to Supabase if not running)

```bash
cd project/backend
uvicorn app.main:app --reload --port 8000
```

Test: http://localhost:8000/api/medicines/search?q=para

### 4. Start Frontend

```bash
cd project
npm run dev
```

Navigate to **Billing POS** and type a medicine name. You'll see:
- 🟢 **In Stock** — from your inventory (ready to add instantly)
- 🔵 **Medicine Catalog** — from the 50k+ database (enter batch + expiry)

---

## Using Your Kaggle Dataset

If you have a Kaggle CSV (A-Z Medicines / Tata 1mg / etc.):

```bash
cd project/backend/scripts

# Step 1: Clean the CSV (auto-detects column names)
python clean_medicines.py --input /path/to/raw_medicines.csv --output cleaned_medicines.csv

# Step 2: Bulk import (batches of 500, skips duplicates)
python import_medicines.py --input cleaned_medicines.csv
```

Recommended datasets:
- [A-Z Medicine Dataset](https://www.kaggle.com/datasets/shudhanshusingh/az-medicine-dataset-of-india)
- [1mg Medicine Dataset](https://www.kaggle.com/datasets/singhnavjot2062001/11000-medicine-details)

---

## How the Autocomplete Works

```
User types in Billing → useMedicineSearch hook (300ms debounce)
                              │
                    ┌─────────┴──────────┐
                    │                    │
              FastAPI :8000        Supabase direct
              (if running)         (fallback)
                    │                    │
                    └─────────┬──────────┘
                              │
                    medicine_catalog results
                              │
                    Combined dropdown:
                    [In Stock] → click to add instantly
                    [Catalog]  → click to enter batch+expiry
```

---

## API Endpoints

| Endpoint | Description |
|---|---|
| `GET /api/medicines/search?q=para&limit=10` | Search by name/manufacturer |
| `GET /api/medicines/catalog?page=1&size=50` | Browse full catalog |
| `GET /api/medicines/stats` | Catalog record count |
| `GET /health` | Health check |

---

## Environment Variables

| Variable | Required | Notes |
|---|---|---|
| `VITE_SUPABASE_URL` | Yes | Frontend + backend |
| `VITE_SUPABASE_ANON_KEY` | Yes | Frontend autocomplete fallback |
| `SUPABASE_SERVICE_KEY` | For imports | Write access for bulk import |
| `VITE_API_URL` | Optional | Default: http://localhost:8000 |
