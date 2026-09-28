from typing import List, Optional, Any
from pydantic import BaseModel
import datetime

# Auth Schemas
class LoginRequest(BaseModel):
    email: str
    password: str

class UserSchema(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    department: str

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserSchema

# Field Schemas
class ExtractedFieldSchema(BaseModel):
    id: Optional[int] = None
    field_key: str
    field_name: str
    field_value: Optional[str] = None # English translation / OCR value
    original_script_value: Optional[str] = None # Native script
    confidence: float
    status: str # high, medium, low, manual_verification_required
    source: Optional[str] = "document" # document, ocr, registry_api
    normalized_value: Optional[str] = None
    registry_value: Optional[str] = None
    registry_source: Optional[str] = None
    comparison_result: Optional[str] = "NEEDS_REVIEW" # MATCH, MISMATCH, NOT_AVAILABLE, NEEDS_REVIEW
    is_edited: bool = False
    original_value: Optional[str] = None
    corrected_value: Optional[str] = None

    class Config:
        from_attributes = True

class FieldUpdate(BaseModel):
    field_value: str

# Validation Schemas
class ValidationCheckSchema(BaseModel):
    category: str
    check_name: str
    status: str # valid, warning, error
    message: str
    score: float

class ValidationResponse(BaseModel):
    overall_score: float
    status: str
    checks: List[ValidationCheckSchema]

# Review Task Schemas
class ReviewTaskSchema(BaseModel):
    id: str
    document_id: str
    field_key: str
    field_name: str
    extracted_value: Optional[str] = None
    confidence: float
    reason: str
    status: str
    assigned_to: str
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime.datetime] = None
    correction_notes: Optional[str] = None

    class Config:
        from_attributes = True

class ReviewActionRequest(BaseModel):
    action: str # approve, edit, reject
    corrected_value: Optional[str] = None
    notes: Optional[str] = None

# Land Record Schemas
class LandRecordSchema(BaseModel):
    id: str
    document_id: str
    owner_name: str
    father_name: Optional[str] = None
    khasra_number: str
    khata_number: Optional[str] = None
    plot_number: Optional[str] = None
    area: float
    area_unit: str = "Acres"
    village: str
    tehsil: str
    district: str
    state: str
    mutation_number: Optional[str] = None
    document_date: Optional[str] = None
    land_type: str = "Agricultural"
    ulpin: Optional[str] = None
    status: str
    validation_score: float
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# Document Schemas
class DocumentSchema(BaseModel):
    id: str
    filename: str
    file_path: str
    file_size: int
    mime_type: str
    status: str
    confidence_score: float
    uploaded_by: str
    detected_language: Optional[str] = "Telugu (తెలుగు)"
    original_text: Optional[str] = None
    translated_text: Optional[str] = None
    registry_source_label: Optional[str] = None
    debug_info: Optional[Any] = None
    created_at: datetime.datetime
    fields: List[ExtractedFieldSchema] = []
    land_record: Optional[LandRecordSchema] = None

    class Config:
        from_attributes = True

# Audit Log Schemas
class AuditLogSchema(BaseModel):
    id: int
    document_id: Optional[str] = None
    user_name: str
    action: str
    field_changed: Optional[str] = None
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    timestamp: datetime.datetime
    details: Optional[str] = None

    class Config:
        from_attributes = True

# GIS Parcel Schema
class GISParcelSchema(BaseModel):
    id: str
    ulpin: str
    owner_name: str
    khasra_number: str
    village: str
    district: str
    area: float
    land_type: str
    coordinates_json: str
    center_lat: float
    center_lng: float
    status: str

    class Config:
        from_attributes = True

# Dashboard Stats Schema
class StatsResponse(BaseModel):
    total_documents: int
    processed_records: int
    pending_reviews: int
    validation_issues: int
    high_confidence_records: int
    avg_confidence: float
    documents_trend: List[dict]
    validation_status_breakdown: List[dict]
    confidence_distribution: List[dict]

# Demo Mode Response
class DemoProcessResponse(BaseModel):
    success: bool
    message: str
    document_id: str
    record_id: str
    confidence: float
    validation_score: float
