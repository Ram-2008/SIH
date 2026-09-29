import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database.session import engine, Base, SessionLocal
from app.utils.seed_data import seed_database

# Import Routers
from app.api.auth import router as auth_router
from app.api.dashboard import router as dashboard_router
from app.api.documents import router as documents_router
from app.api.reviews import router as reviews_router
from app.api.records import router as records_router
from app.api.gis import router as gis_router
from app.api.audit import router as audit_router
from app.api.demo import router as demo_router

# Initialize FastAPI App
app = FastAPI(
    title="Geo Plot",
    description="Intelligent Multilingual Land Record Digitization & Validation Platform - Smart India Hackathon Prototype",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables and seed initial demo data on startup
@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

# Mount Static Files for Uploads and Preprocessed Images
os.makedirs("sample-data/documents", exist_ok=True)
os.makedirs("sample-data/documents/preprocessed", exist_ok=True)
app.mount("/sample-data", StaticFiles(directory="sample-data"), name="sample-data")

# Register API Routers
app.include_router(auth_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(documents_router, prefix="/api")
app.include_router(reviews_router, prefix="/api")
app.include_router(records_router, prefix="/api")
app.include_router(gis_router, prefix="/api")
app.include_router(audit_router, prefix="/api")
app.include_router(demo_router, prefix="/api")

@app.get("/")
def root():
    return {
        "title": "Geo Plot API Engine",
        "team": "The Straw Hats",
        "team_id": "137647",
        "status": "Online & Ready",
        "docs_url": "/docs",
        "version": "1.0.0"
    }
