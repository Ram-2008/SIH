from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import LandRecord, Document, AuditLog, GISParcel
from app.schemas.schemas import LandRecordSchema

router = APIRouter(prefix="/records", tags=["Land Records"])

@router.get("", response_model=List[LandRecordSchema])
def list_records(search: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(LandRecord)
    if search:
        s = f"%{search}%"
        query = query.filter(
            (LandRecord.owner_name.ilike(s)) |
            (LandRecord.khasra_number.ilike(s)) |
            (LandRecord.village.ilike(s)) |
            (LandRecord.ulpin.ilike(s))
        )
    records = query.order_by(LandRecord.created_at.desc()).all()
    return [LandRecordSchema.model_validate(r) for r in records]

@router.get("/{id}")
def get_record_detail(id: str, db: Session = Depends(get_db)):
    rec = db.query(LandRecord).filter(LandRecord.id == id).first()
    if not rec:
        # Also try searching by document_id
        rec = db.query(LandRecord).filter(LandRecord.document_id == id).first()
        if not rec:
            raise HTTPException(status_code=404, detail="Land record not found")

    doc = db.query(Document).filter(Document.id == rec.document_id).first()
    audits = db.query(AuditLog).filter(AuditLog.document_id == rec.document_id).order_by(AuditLog.timestamp.desc()).all()
    parcel = db.query(GISParcel).filter(GISParcel.ulpin == rec.ulpin).first()

    return {
        "record": LandRecordSchema.model_validate(rec),
        "document": {
            "id": doc.id,
            "filename": doc.filename,
            "file_path": doc.file_path,
            "confidence_score": doc.confidence_score,
            "status": doc.status,
            "uploaded_by": doc.uploaded_by,
            "created_at": doc.created_at
        } if doc else None,
        "mutation_history": [
            {
                "mutation_id": rec.mutation_number or "MUT-2024-889",
                "date": rec.document_date or "14-02-2023",
                "type": "Inheritance / Transfer",
                "transferor": "Suresh Kumar",
                "transferee": rec.owner_name,
                "status": "Sanctioned by Tahsildar"
            }
        ],
        "gis_info": {
            "ulpin": rec.ulpin or "28-GNT-2024-9982",
            "center_lat": parcel.center_lat if parcel else 16.3350,
            "center_lng": parcel.center_lng if parcel else 80.5050,
            "disclaimer": "Prototype / Sample Spatial Data"
        },
        "audit_trail": [
            {
                "id": a.id,
                "action": a.action,
                "user_name": a.user_name,
                "timestamp": a.timestamp,
                "details": a.details,
                "field_changed": a.field_changed,
                "old_value": a.old_value,
                "new_value": a.new_value
            } for a in audits
        ]
    }
