from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import GISParcel
from app.schemas.schemas import GISParcelSchema

router = APIRouter(prefix="/gis", tags=["GIS & Cadastral Parcels"])

@router.get("/parcels", response_model=List[GISParcelSchema])
def get_parcels(db: Session = Depends(get_db)):
    parcels = db.query(GISParcel).all()
    return [GISParcelSchema.model_validate(p) for p in parcels]
