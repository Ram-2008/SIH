import os
import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Body
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import Document, ExtractedField, AuditLog, ReviewTask
from app.schemas.schemas import DocumentSchema, FieldUpdate, ExtractedFieldSchema
from app.services.document_processor import document_processor_service

router = APIRouter(prefix="/documents", tags=["Documents"])

UPLOAD_DIR = "sample-data/documents"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    doc_id = f"DOC-{uuid.uuid4().hex[:6].upper()}"
    file_extension = os.path.splitext(file.filename)[1].lower()
    
    if file_extension not in [".pdf", ".png", ".jpg", ".jpeg", ".tiff", ".bmp"]:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, PNG, JPG or JPEG.")

    saved_filename = f"{doc_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, saved_filename)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    doc = Document(
        id=doc_id,
        filename=file.filename,
        file_path=file_path,
        file_size=len(content),
        mime_type=file.content_type or "image/jpeg",
        status="Uploaded",
        confidence_score=0.0,
        uploaded_by="Revenue Officer",
        created_at=datetime.datetime.utcnow()
    )
    db.add(doc)

    audit = AuditLog(
        document_id=doc_id,
        user_name="Revenue Officer",
        action="Document Uploaded",
        details=f"Uploaded document '{file.filename}' ({len(content) // 1024} KB)"
    )
    db.add(audit)

    db.commit()
    db.refresh(doc)
    return {"message": "Document uploaded successfully", "document_id": doc_id, "document": DocumentSchema.model_validate(doc)}

@router.post("/{id}/process")
def process_document(id: str, db: Session = Depends(get_db)):
    try:
        doc = document_processor_service.process_document(db, id)
        return {"message": "Document processed successfully", "document": DocumentSchema.model_validate(doc)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("", response_model=List[DocumentSchema])
def list_documents(status: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Document)
    if status:
        query = query.filter(Document.status == status)
    docs = query.order_by(Document.created_at.desc()).all()
    return [DocumentSchema.model_validate(d) for d in docs]

@router.get("/{id}", response_model=DocumentSchema)
def get_document(id: str, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return DocumentSchema.model_validate(doc)

@router.put("/{id}/fields/{field_key}")
def update_document_field(id: str, field_key: str, payload: FieldUpdate, db: Session = Depends(get_db)):
    field = db.query(ExtractedField).filter(
        ExtractedField.document_id == id,
        ExtractedField.field_key == field_key
    ).first()
    
    if not field:
        raise HTTPException(status_code=404, detail=f"Field {field_key} not found")

    old_val = field.field_value
    field.original_value = old_val if not field.is_edited else field.original_value
    field.field_value = payload.field_value
    field.corrected_value = payload.field_value
    field.is_edited = True
    field.confidence = 100.0
    field.status = "high"

    # Also check if there's an associated pending review task and update it
    rev_task = db.query(ReviewTask).filter(
        ReviewTask.document_id == id,
        ReviewTask.field_key == field_key
    ).first()
    if rev_task:
        rev_task.status = "Corrected"
        rev_task.reviewed_by = "Revenue Officer"
        rev_task.reviewed_at = datetime.datetime.utcnow()
        rev_task.correction_notes = f"Manually edited on extraction page from '{old_val}' to '{payload.field_value}'"

    audit = AuditLog(
        document_id=id,
        user_name="Revenue Officer",
        action="Field Manually Edited",
        field_changed=field.field_name,
        old_value=old_val,
        new_value=payload.field_value,
        details="Field updated via Extraction Results interface. Model active learning log updated."
    )
    db.add(audit)

    db.commit()
    return {"message": "Field updated successfully", "field": ExtractedFieldSchema.model_validate(field)}
