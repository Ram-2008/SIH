import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(String, default="REVENUE_OFFICER") # ADMIN, REVENUE_OFFICER, REVIEWER
    department = Column(String, default="Revenue & Land Records")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, default=0)
    mime_type = Column(String, default="application/pdf")
    status = Column(String, default="Uploaded") # Uploaded, Preprocessed, OCR_Extracted, Validated, Under Review, Verified
    confidence_score = Column(Float, default=0.0)
    uploaded_by = Column(String, default="System User")
    detected_language = Column(String, default="Telugu / Tamil (regional)")
    original_text = Column(Text, nullable=True)
    translated_text = Column(Text, nullable=True)
    registry_source_label = Column(String, nullable=True)
    debug_info = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    fields = relationship("ExtractedField", back_populates="document", cascade="all, delete-orphan")
    validation_results = relationship("ValidationResult", back_populates="document", cascade="all, delete-orphan")
    review_tasks = relationship("ReviewTask", back_populates="document", cascade="all, delete-orphan")
    land_record = relationship("LandRecord", back_populates="document", uselist=False, cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="document", cascade="all, delete-orphan")

class ExtractedField(Base):
    __tablename__ = "extracted_fields"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    field_key = Column(String, nullable=False)
    field_name = Column(String, nullable=False)
    field_value = Column(Text, nullable=True) # English translation / OCR extracted value
    original_script_value = Column(Text, nullable=True) # Native script
    confidence = Column(Float, default=0.0)
    status = Column(String, default="high") # high, medium, low, manual_verification_required
    source = Column(String, default="document") # document, ocr, registry_api
    normalized_value = Column(Text, nullable=True)
    registry_value = Column(Text, nullable=True)
    registry_source = Column(String, nullable=True)
    comparison_result = Column(String, default="NEEDS_REVIEW") # MATCH, MISMATCH, NOT_AVAILABLE, NEEDS_REVIEW
    is_edited = Column(Boolean, default=False)
    original_value = Column(Text, nullable=True)
    corrected_value = Column(Text, nullable=True)
    bbox_json = Column(Text, nullable=True)

    document = relationship("Document", back_populates="fields")

class LandRecord(Base):
    __tablename__ = "land_records"

    id = Column(String, primary_key=True, index=True)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    owner_name = Column(String, nullable=False)
    father_name = Column(String, nullable=True)
    khasra_number = Column(String, nullable=False)
    khata_number = Column(String, nullable=True)
    plot_number = Column(String, nullable=True)
    area = Column(Float, default=0.0)
    area_unit = Column(String, default="Acres")
    village = Column(String, nullable=False)
    tehsil = Column(String, nullable=False)
    district = Column(String, nullable=False)
    state = Column(String, nullable=False)
    mutation_number = Column(String, nullable=True)
    document_date = Column(String, nullable=True)
    land_type = Column(String, default="Agricultural")
    ulpin = Column(String, nullable=True)
    status = Column(String, default="Verified") # Draft, Under Review, Verified
    validation_score = Column(Float, default=100.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    document = relationship("Document", back_populates="land_record")

class ValidationResult(Base):
    __tablename__ = "validation_results"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    category = Column(String, nullable=False)
    check_name = Column(String, nullable=False)
    status = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    score = Column(Float, default=100.0)

    document = relationship("Document", back_populates="validation_results")

class ReviewTask(Base):
    __tablename__ = "review_tasks"

    id = Column(String, primary_key=True, index=True)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    field_key = Column(String, nullable=False)
    field_name = Column(String, nullable=False)
    extracted_value = Column(Text, nullable=True)
    confidence = Column(Float, default=0.0)
    reason = Column(String, default="Low confidence score")
    status = Column(String, default="Pending")
    assigned_to = Column(String, default="Revenue Officer")
    reviewed_by = Column(String, nullable=True)
    reviewed_at = Column(DateTime, nullable=True)
    correction_notes = Column(Text, nullable=True)

    document = relationship("Document", back_populates="review_tasks")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(String, ForeignKey("documents.id"), nullable=True)
    user_name = Column(String, default="System")
    action = Column(String, nullable=False)
    field_changed = Column(String, nullable=True)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    details = Column(Text, nullable=True)

    document = relationship("Document", back_populates="audit_logs")

class GISParcel(Base):
    __tablename__ = "gis_parcels"

    id = Column(String, primary_key=True, index=True)
    ulpin = Column(String, unique=True, index=True, nullable=False)
    owner_name = Column(String, nullable=False)
    khasra_number = Column(String, nullable=False)
    village = Column(String, nullable=False)
    district = Column(String, nullable=False)
    area = Column(Float, default=0.0)
    land_type = Column(String, default="Agricultural")
    coordinates_json = Column(Text, nullable=False)
    center_lat = Column(Float, nullable=False)
    center_lng = Column(Float, nullable=False)
    status = Column(String, default="Verified")
