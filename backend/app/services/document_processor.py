import uuid
import datetime
from typing import Dict, Any
from sqlalchemy.orm import Session
from app.models.models import Document, ExtractedField, LandRecord, ValidationResult, ReviewTask, AuditLog
from app.ocr.ocr_engine import ocr_engine
from app.validation.entity_extractor import entity_extractor
from app.validation.validation_service import validation_service
from app.services.land_registry_service import land_registry_service
from app.services.comparison_engine import comparison_engine

def safe_print(text: str):
    """Print to console safely on Windows terminals without UnicodeEncodeError."""
    try:
        print(text)
    except UnicodeEncodeError:
        print(text.encode("ascii", errors="replace").decode("ascii"))

class DocumentProcessorService:
    """
    Complete Pipeline Orchestrator for Geo Plot:
    Document Upload -> Preprocessing -> OCR & Translation -> Entity Extraction ->
    Land Registry Search -> Response Normalization -> Comparison Engine -> Validation -> Audit Log
    """

    def process_document(self, db: Session, document_id: str) -> Document:
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            raise ValueError(f"Document {document_id} not found")

        # Update status
        doc.status = "Preprocessing"
        db.commit()

        # Step 1 & 2: OpenCV Preprocessing, Multilingual OCR & Translation
        ocr_result = ocr_engine.extract_text(doc.file_path)
        raw_text = ocr_result.get("text", "")
        orig_text = ocr_result.get("original_text", raw_text)
        detected_lang = ocr_result.get("detected_language", "Regional Script")

        safe_print("\n" + "=" * 60)
        safe_print("[OCR]")
        safe_print(f"Document ID: {document_id}")
        safe_print(f"Engine Used: {ocr_result.get('engine_used')}")
        safe_print(f"Detected Language: {detected_lang}")
        safe_print("Document processed successfully")

        doc.status = "OCR_Extracted"
        doc.detected_language = detected_lang
        doc.original_text = orig_text
        doc.translated_text = raw_text
        db.commit()

        # Step 3: Entity Extraction (Without fabricating defaults)
        extracted_fields_data = entity_extractor.extract_entities(raw_text)

        safe_print("\n[EXTRACTION]")
        for f in extracted_fields_data:
            val = f["field_value"] if f["field_value"] is not None else "[UNREADABLE / MISSING]"
            safe_print(f"  {f['field_name']}: {val} (Confidence: {f['confidence']}%)")

        field_dict = {f["field_key"]: f["field_value"] for f in extracted_fields_data}

        # Step 4: Land Record Retrieval (API / DB Search)
        district = field_dict.get("district")
        mandal = field_dict.get("tehsil")
        village = field_dict.get("village")
        survey_number = field_dict.get("khasra_number")
        khata_number = field_dict.get("khata_number")

        registry_lookup = land_registry_service.lookup_record(
            district=district,
            mandal=mandal,
            village=village,
            survey_number=survey_number,
            khata_number=khata_number,
            db_session=db
        )

        status_code = registry_lookup.get("status_code", 200)
        source_label = registry_lookup.get("source_label", "DEMO DATA — NOT A GOVERNMENT RECORD")
        retrieved_raw = registry_lookup.get("record")
        matching_count = registry_lookup.get("records_returned", 0)

        # Step 5: API Response Normalization
        normalized_registry_record = land_registry_service.normalize_land_record_response(retrieved_raw)

        # Step 6: Comparison Engine
        compared_fields = comparison_engine.compare_records(extracted_fields_data, normalized_registry_record)

        # EXACT DEBUG LOGGING OUTPUTS
        import json
        safe_print("\n" + "=" * 60)
        safe_print("[OCR & EXTRACTION]")
        safe_print(f"Document ID: {document_id} | Engine: {ocr_result.get('engine_used')} | Language: {detected_lang}")
        
        safe_print("\nEXTRACTED DATA:")
        safe_print(json.dumps(field_dict, indent=2))

        safe_print("\nSEARCH PARAMETERS:")
        safe_print(json.dumps(registry_lookup.get("request_params", {}), indent=2))

        safe_print("\nRAW API RESPONSE:")
        safe_print(json.dumps(registry_lookup.get("raw_response"), indent=2))

        safe_print("\nNORMALIZED RECORD:")
        safe_print(json.dumps(normalized_registry_record, indent=2))

        safe_print("\nFINAL DISPLAY DATA:")
        final_display = [
            {
                "field_name": cf["field_name"],
                "ocr_value": cf["field_value"],
                "source": cf.get("source", "document"),
                "confidence": cf.get("confidence"),
                "registry_value": cf.get("registry_value"),
                "status": cf.get("comparison_result", "NEEDS_REVIEW")
            } for cf in compared_fields
        ]
        safe_print(json.dumps(final_display, indent=2))
        safe_print("=" * 60 + "\n")

        # Clear existing extracted fields, validation results, and review tasks for this document
        db.query(ExtractedField).filter(ExtractedField.document_id == document_id).delete()
        db.query(ValidationResult).filter(ValidationResult.document_id == document_id).delete()
        db.query(ReviewTask).filter(ReviewTask.document_id == document_id).delete()

        # Save fields to DB & calculate average confidence
        total_conf = 0.0
        low_conf_fields = []
        mismatch_count = 0

        for cf in compared_fields:
            ef = ExtractedField(
                document_id=document_id,
                field_key=cf["field_key"],
                field_name=cf["field_name"],
                field_value=cf["field_value"],
                original_script_value=cf.get("original_script_value", cf["field_value"]),
                confidence=cf["confidence"],
                status=cf["status"],
                source="document",
                normalized_value=cf.get("normalized_value"),
                registry_value=cf.get("registry_value"),
                registry_source=source_label,
                comparison_result=cf.get("comparison_result", "NEEDS_REVIEW"),
                original_value=cf["original_value"]
            )
            db.add(ef)
            total_conf += cf["confidence"]

            if cf["confidence"] < 85.0 or cf.get("comparison_result") in ["MISMATCH", "NEEDS_REVIEW"]:
                low_conf_fields.append(cf)
            if cf.get("comparison_result") == "MISMATCH":
                mismatch_count += 1

        avg_confidence = round(total_conf / len(compared_fields), 1) if compared_fields else 0.0
        doc.confidence_score = avg_confidence
        doc.registry_source_label = source_label

        # Build Debug Mode Payload
        doc.debug_info = {
            "uploaded_filename": doc.filename,
            "ocr_raw_text": orig_text,
            "extracted_json": extracted_fields_data,
            "ocr_confidence": avg_confidence,
            "api_request_parameters": {
                "district": district,
                "mandal": mandal,
                "village": village,
                "survey_number": survey_number,
                "khata_number": khata_number
            },
            "api_http_status": status_code,
            "api_response": registry_lookup.get("raw_response", retrieved_raw),
            "normalized_api_response": normalized_registry_record,
            "comparison_result": [
                {
                    "field_key": cf["field_key"],
                    "field_name": cf["field_name"],
                    "ocr_value": cf["field_value"],
                    "registry_value": cf.get("registry_value"),
                    "comparison_result": cf.get("comparison_result"),
                    "normalized_ocr": cf.get("normalized_value"),
                    "normalized_registry": cf.get("normalized_registry_value")
                } for cf in compared_fields
            ]
        }

        # Step 7: Business Validation Engine
        validation_output = validation_service.validate_record(field_dict)

        for check in validation_output["checks"]:
            vr = ValidationResult(
                document_id=document_id,
                category=check["category"],
                check_name=check["check_name"],
                status=check["status"],
                message=check["message"],
                score=check["score"]
            )
            db.add(vr)

        # Step 8: Review Queue generation
        for lcf in low_conf_fields:
            reason = f"Low confidence ({lcf['confidence']}%)" if lcf['confidence'] < 85.0 else f"Registry {lcf.get('comparison_result', 'NEEDS_REVIEW')}"
            rt_id = f"REV-{uuid.uuid4().hex[:6].upper()}"
            rt = ReviewTask(
                id=rt_id,
                document_id=document_id,
                field_key=lcf["field_key"],
                field_name=lcf["field_name"],
                extracted_value=lcf["field_value"],
                confidence=lcf["confidence"],
                reason=reason,
                status="Pending",
                assigned_to="Revenue Officer"
            )
            db.add(rt)

        # Step 9: Create or update Land Record (using extracted or normalized values)
        rec_id = f"REC-{uuid.uuid4().hex[:6].upper()}"
        land_record = db.query(LandRecord).filter(LandRecord.document_id == document_id).first()

        area_val = 0.0
        if field_dict.get("area"):
            import re
            m = re.search(r"(\d+(?:\.\d+)?)", str(field_dict.get("area")))
            if m:
                area_val = float(m.group(1))

        if not land_record:
            land_record = LandRecord(
                id=rec_id,
                document_id=document_id,
                owner_name=field_dict.get("owner_name") or "Unspecified",
                father_name=field_dict.get("father_name"),
                khasra_number=field_dict.get("khasra_number") or "Unspecified",
                khata_number=field_dict.get("khata_number"),
                plot_number=field_dict.get("plot_number"),
                area=area_val,
                area_unit="Acres",
                village=field_dict.get("village") or "Unspecified",
                tehsil=field_dict.get("tehsil") or "Unspecified",
                district=field_dict.get("district") or "Unspecified",
                state=field_dict.get("state") or "Unspecified",
                mutation_number=field_dict.get("mutation_number"),
                document_date=field_dict.get("document_date"),
                land_type=field_dict.get("land_type") or "Agricultural",
                ulpin=f"ULPIN-{uuid.uuid4().hex[:8].upper()}",
                status="Under Review" if (low_conf_fields or mismatch_count > 0) else "Verified",
                validation_score=validation_output["overall_score"]
            )
            db.add(land_record)
        else:
            if field_dict.get("owner_name"):
                land_record.owner_name = field_dict.get("owner_name")
            if field_dict.get("khasra_number"):
                land_record.khasra_number = field_dict.get("khasra_number")
            land_record.status = "Under Review" if (low_conf_fields or mismatch_count > 0) else "Verified"
            land_record.validation_score = validation_output["overall_score"]

        # Step 10: Update Document Status
        doc.status = "Under Review" if (low_conf_fields or mismatch_count > 0) else "Verified"

        # Step 11: Audit Log
        audit = AuditLog(
            document_id=document_id,
            user_name="Geo Plot Pipeline",
            action="Multilingual Verification Completed",
            details=f"Language: {detected_lang}. Source: {source_label}. Extracted {len(compared_fields)} fields. Mismatches: {mismatch_count}. Avg Confidence: {avg_confidence}%."
        )
        db.add(audit)

        db.commit()
        db.refresh(doc)
        return doc

document_processor_service = DocumentProcessorService()
