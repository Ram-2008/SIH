import os
import re
import json
import logging
import urllib.request
import urllib.error
from typing import Dict, Any, Optional, List
from sqlalchemy.orm import Session
from app.models.models import LandRecord, GISParcel

logger = logging.getLogger("bhu_drishti_registry")
logging.basicConfig(level=logging.INFO)

class LandRegistryService:
    """
    Land Record Search & Verification Service.
    - Searches real configured Government Land Registry API (if GOVT_LAND_API_URL & GOVT_LAND_API_KEY set).
    - Falls back to local Land Registry Database.
    - Explicitly labels data sources (e.g., 'DEMO DATA — NOT GOVERNMENT RECORDS').
    - Normalizes response fields using normalizeLandRecordResponse schema.
    - Never invents missing data fields (returns None if missing).
    """

    def normalize_survey_number(self, survey_num: str) -> str:
        """Normalize survey/khasra numbers while preserving numeric meaning."""
        if not survey_num:
            return ""
        # Remove extra spaces around slashes or hyphens: "157 / 23" -> "157/23"
        cleaned = re.sub(r"\s*([/\-])\s*", r"\1", survey_num.strip())
        return cleaned

    def normalize_string(self, text: str) -> str:
        """Trim whitespace, lowercase, normalize capitalization and punctuation."""
        if not text:
            return ""
        # Remove multiple spaces, strip, lowercase
        cleaned = re.sub(r"\s+", " ", text.strip().lower())
        return cleaned

    def normalize_land_record_response(self, raw_data: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Standardizes API/Database raw land record response into strict internal schema.
        If a field does not exist in the response, returns None (DO NOT INVENT DATA).
        """
        if not raw_data:
            return {
                "owner_name": None,
                "father_name": None,
                "survey_number": None,
                "khata_number": None,
                "plot_number": None,
                "land_area": None,
                "village": None,
                "mandal": None,
                "district": None,
                "state": None,
                "mutation_number": None,
                "document_date": None,
                "land_type": None,
                "irrigation_type": None
            }

        # Safe key extractor helper
        def get_val(keys: List[str]) -> Optional[str]:
            for k in keys:
                if k in raw_data and raw_data[k] is not None and str(raw_data[k]).strip() != "":
                    return str(raw_data[k]).strip()
            return None

        area_val = get_val(["land_area", "area", "extent"])
        area_unit = get_val(["area_unit", "unit"]) or "Acres"
        formatted_area = f"{area_val} {area_unit}" if area_val else None

        return {
            "owner_name": get_val(["owner_name", "landowner_name", "pattadar_name"]),
            "father_name": get_val(["father_name", "guardian_name", "pattadar_father"]),
            "survey_number": self.normalize_survey_number(get_val(["survey_number", "khasra_number", "khasra_no"]) or ""),
            "khata_number": get_val(["khata_number", "khata_no"]),
            "plot_number": get_val(["plot_number", "plot_no"]),
            "land_area": formatted_area,
            "village": get_val(["village", "gram"]),
            "mandal": get_val(["mandal", "tehsil", "block"]),
            "district": get_val(["district"]),
            "state": get_val(["state"]),
            "mutation_number": get_val(["mutation_number", "mutation_no"]),
            "document_date": get_val(["document_date", "registration_date"]),
            "land_type": get_val(["land_type", "classification"]),
            "irrigation_type": get_val(["irrigation_type", "water_source"])
        }

    def search_land_registry(self, db: Session, params: Dict[str, str]) -> Dict[str, Any]:
        """
        Executes land record search using district, mandal, village, survey_number, khata_number.
        Uses exact multi-parameter filtering without returning arbitrary default records.
        """
        district = params.get("district", "").strip()
        mandal = (params.get("tehsil", "") or params.get("mandal", "")).strip()
        village = params.get("village", "").strip()
        raw_survey = params.get("khasra_number", "") or params.get("survey_number", "")
        survey_number = self.normalize_survey_number(raw_survey)
        khata_number = (params.get("khata_number", "") or "").strip()

        req_params = {
            "district": district or None,
            "mandal": mandal or None,
            "village": village or None,
            "survey_number": survey_number or None,
            "khata_number": khata_number or None
        }

        api_url = os.getenv("GOVT_LAND_API_URL")
        api_key = os.getenv("GOVT_LAND_API_KEY")

        # 1. REAL AUTHORIZED GOVERNMENT API CALL
        if api_url:
            logger.info(f"[LAND RECORD API] Requesting real API: {api_url}")
            logger.info(f"[LAND RECORD API] Query params: {json.dumps(req_params)}")

            try:
                headers = {"Content-Type": "application/json"}
                if api_key:
                    headers["Authorization"] = f"Bearer {api_key}"

                req = urllib.request.Request(api_url, data=json.dumps(req_params).encode("utf-8"), headers=headers)
                with urllib.request.urlopen(req, timeout=10) as response:
                    status_code = response.getcode()
                    raw_resp = json.loads(response.read().decode("utf-8"))
                    
                    logger.info(f"[LAND RECORD API] Status: {status_code}")
                    records = raw_resp.get("records", [raw_resp]) if isinstance(raw_resp, dict) else raw_resp

                    if not records or len(records) == 0:
                        return {
                            "status": "NO_RECORD_FOUND",
                            "message": "No matching record found in government land registry.",
                            "source_label": "GOVERNMENT LAND REGISTRY API",
                            "status_code": status_code,
                            "records_returned": 0,
                            "normalized_record": self.normalize_land_record_response(None),
                            "raw_response": raw_resp,
                            "request_params": req_params
                        }
                    elif len(records) > 1:
                        return {
                            "status": "MULTIPLE_RECORDS_FOUND",
                            "message": "Multiple records found — manual selection required.",
                            "source_label": "GOVERNMENT LAND REGISTRY API",
                            "status_code": status_code,
                            "records_returned": len(records),
                            "normalized_record": self.normalize_land_record_response(None),
                            "raw_response": raw_resp,
                            "request_params": req_params
                        }
                    else:
                        return {
                            "status": "SUCCESS",
                            "message": "Record retrieved from Government Land Registry API.",
                            "source_label": "GOVERNMENT LAND REGISTRY API",
                            "status_code": status_code,
                            "records_returned": 1,
                            "record": records[0],
                            "normalized_record": self.normalize_land_record_response(records[0]),
                            "raw_response": raw_resp,
                            "request_params": req_params
                        }
            except Exception as e:
                logger.error(f"[LAND RECORD API] Error calling government API: {e}")

        # 2. LOCAL REGISTRY DATABASE LOOKUP WITH STRICT MULTI-PARAM FILTERING
        logger.info(f"[LAND RECORD API] Querying local registry database with params: {json.dumps(req_params)}")

        # If no specific identifier (survey, khata, village) is provided, return NO_RECORD_FOUND instead of query.all()
        if not (survey_number or khata_number or village):
            logger.info("[LAND RECORD API] Insufficient search parameters. Returning NO_RECORD_FOUND.")
            return {
                "status": "NO_RECORD_FOUND",
                "message": "No matching record found in land registry.",
                "source_label": "DEMO DATA — NOT A GOVERNMENT RECORD",
                "status_code": 404,
                "records_returned": 0,
                "record": None,
                "normalized_record": self.normalize_land_record_response(None),
                "raw_response": None,
                "request_params": req_params
            }

        query = db.query(LandRecord)

        if survey_number:
            query = query.filter(LandRecord.khasra_number.ilike(f"%{survey_number}%"))
        if khata_number:
            query = query.filter(LandRecord.khata_number.ilike(f"%{khata_number}%"))
        if village:
            query = query.filter(LandRecord.village.ilike(f"%{village}%"))
        if mandal:
            query = query.filter(LandRecord.tehsil.ilike(f"%{mandal}%"))
        if district:
            query = query.filter(LandRecord.district.ilike(f"%{district}%"))

        matches = query.all()
        logger.info(f"[LAND RECORD API] Database matches returned: {len(matches)}")

        if len(matches) == 1:
            m = matches[0]
            raw_dict = {
                "owner_name": m.owner_name,
                "father_name": m.father_name,
                "survey_number": m.khasra_number,
                "khata_number": m.khata_number,
                "plot_number": m.plot_number,
                "area": m.area,
                "area_unit": m.area_unit,
                "village": m.village,
                "tehsil": m.tehsil,
                "district": m.district,
                "state": m.state,
                "mutation_number": m.mutation_number,
                "document_date": m.document_date,
                "land_type": m.land_type,
                "ulpin": m.ulpin
            }
            return {
                "status": "SUCCESS",
                "message": "Record retrieved from Land Registry Database.",
                "source_label": "DEMO DATA — NOT A GOVERNMENT RECORD",
                "status_code": 200,
                "records_returned": 1,
                "record": raw_dict,
                "normalized_record": self.normalize_land_record_response(raw_dict),
                "raw_response": raw_dict,
                "request_params": req_params
            }
        elif len(matches) > 1:
            # DO NOT AUTOMATICALLY SELECT FIRST RECORD WHEN MULTIPLE MATCHES ARE FOUND!
            return {
                "status": "MULTIPLE_RECORDS_FOUND",
                "message": "Multiple records found — manual verification required.",
                "source_label": "DEMO DATA — NOT A GOVERNMENT RECORD",
                "status_code": 200,
                "records_returned": len(matches),
                "record": None,
                "normalized_record": self.normalize_land_record_response(None),
                "raw_response": [m.id for m in matches],
                "request_params": req_params
            }
        else:
            return {
                "status": "NO_RECORD_FOUND",
                "message": "No matching record found in land registry.",
                "source_label": "DEMO DATA — NOT A GOVERNMENT RECORD",
                "status_code": 404,
                "records_returned": 0,
                "record": None,
                "normalized_record": self.normalize_land_record_response(None),
                "raw_response": None,
                "request_params": req_params
            }

    def lookup_record(
        self,
        district: Optional[str] = None,
        mandal: Optional[str] = None,
        village: Optional[str] = None,
        survey_number: Optional[str] = None,
        khata_number: Optional[str] = None,
        db_session: Optional[Session] = None
    ) -> Dict[str, Any]:
        """Wrapper method calling search_land_registry."""
        if not db_session:
            raise ValueError("db_session is required for land record lookup")
        
        params = {
            "district": district or "",
            "mandal": mandal or "",
            "village": village or "",
            "survey_number": survey_number or "",
            "khata_number": khata_number or ""
        }
        return self.search_land_registry(db=db_session, params=params)

land_registry_service = LandRegistryService()
