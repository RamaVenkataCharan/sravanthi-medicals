from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import logging
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.core.database import Base, engine
from app.models import medicine, batch, bill, bill_item, user, audit_log, counter, store_settings
from app.routers import medicines, auth, batches, bills, reports, settings

logging.basicConfig(level=logging.INFO)

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Sravanthi Medical Stores — Medicine API",
    description="Fast medicine autocomplete for pharmacy billing",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Create tables
Base.metadata.create_all(bind=engine)

# CORS FIX (STRICT)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (web + mobile Expo dev)
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(medicines.router)
app.include_router(auth.router)
app.include_router(batches.router)
app.include_router(bills.router)
app.include_router(reports.router)
app.include_router(settings.router)

@app.get("/")
def root():
    return {"message": "Pharmacy Backend Running"}

@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "service": "medicine-search-api"}
