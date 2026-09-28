import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import ReviewTask, Document, ExtractedField, LandRecord, AuditLog
from app.schemas.schemas import ReviewTaskSchema, ReviewActionRequest

router = APIRouter(prefix="/reviews", tags=["Human Review Queue"])

@router.get("", response_model=List[ReviewTaskSchema])
def list_review_tasks(status: str = "Pending", db: Session = Depends(get_db)):
    tasks = db.query(ReviewTask).filter(ReviewTask.status == status).all()
    return [ReviewTaskSchema.model_validate(t) for t in tasks]

@router.put("/{id}")
def process_review_action(id: str, payload: ReviewActionRequest, db: Session = Depends(get_db)):
    task = db.query(ReviewTask).filter(ReviewTask.id == id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Review task not found")

    doc = db.query(Document).filter(Document.id == task.document_id).first()
    field = db.query(ExtractedField).filter(
        ExtractedField.document_id == task.document_id,
        ExtractedField.field_key == task.field_key
    ).first()
    land_record = db.query(LandRecord).filter(LandRecord.document_id == task.document_id).first()

    old_val = task.extracted_value
    action = payload.action.lower()

    if action == "approve":
        task.status = "Approved"
        task.reviewed_by = "Revenue Officer (Rajesh Sharma)"
        task.reviewed_at = datetime.datetime.utcnow()
        task.correction_notes = payload.notes or "Approved extracted value as accurate."
        
        if field:
            field.confidence = 100.0
            field.status = "high"

        msg = "Field approved by Revenue Officer."

    elif action == "edit" or action == "correct":
        new_val = payload.corrected_value or old_val
        task.status = "Corrected"
        task.reviewed_by = "Revenue Officer (Rajesh Sharma)"
        task.reviewed_at = datetime.datetime.utcnow()
        task.correction_notes = f"Corrected to '{new_val}'. {payload.notes or ''}"

        if field:
            field.field_value = new_val
            field.corrected_value = new_val
            field.is_edited = True
            field.confidence = 100.0
            field.status = "high"

        # If Khasra number was corrected, update LandRecord
        if task.field_key == "khasra_number" and land_record:
            land_record.khasra_number = new_val

        msg = f"Correction saved — used for future model improvement. (Khasra: {new_val})"

    elif action == "reject":
        task.status = "Rejected"
        task.reviewed_by = "Revenue Officer (Rajesh Sharma)"
        task.reviewed_at = datetime.datetime.utcnow()
        task.correction_notes = payload.notes or "Rejected extracted field."

        msg = "Field marked for re-digitization."

    # Check remaining pending tasks for this document
    pending_count = db.query(ReviewTask).filter(
        ReviewTask.document_id == task.document_id,
        ReviewTask.status == "Pending",
        ReviewTask.id != id
    ).count()

    if pending_count == 0 and doc:
        doc.status = "Verified"
        if land_record:
            land_record.status = "Verified"

    audit = AuditLog(
        document_id=task.document_id,
        user_name="Revenue Officer (Rajesh Sharma)",
        action=f"Review Task {action.capitalize()}",
        field_changed=task.field_name,
        old_value=old_val,
        new_value=payload.corrected_value if action in ["edit", "correct"] else old_val,
        details=f"Officer reviewed task {id}. {msg}"
    )
    db.add(audit)

    db.commit()
    return {
        "message": msg,
        "task": ReviewTaskSchema.model_validate(task),
        "document_status": doc.status if doc else "Verified",
        "active_learning_updated": True
    }
