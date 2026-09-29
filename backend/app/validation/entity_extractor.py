import re
from typing import Dict, List, Any

class EntityExtractor:
    """
    Rule-based & Regex Entity Extractor for Indian Land Record Documents.
    Parses OCR text returned from Gemini Vision, Tesseract, or Geo Plot OCR.
    """

    def extract_entities(self, text: str) -> List[Dict[str, Any]]:
        """Extract structured land fields with confidence score and source attribution without fallback fabrication."""
        fields = []

        def find_match(patterns: List[str], text: str) -> Optional[str]:
            if not text:
                return None
            for pat in patterns:
                match = re.search(pat, text, re.IGNORECASE)
                if match and match.group(1).strip():
                    return match.group(1).strip()
            return None

        # Extract structured fields using robust regex patterns against the OCR text
        owner = find_match([
            r"Landowner\s*(?:Name)?\s*:\s*([^\n\r,]+)",
            r"Owner\s*(?:Name)?\s*:\s*([^\n\r,]+)",
            r"Pattadar\s*(?:Name)?\s*:\s*([^\n\r,]+)",
            r"Name\s*:\s*([^\n\r,]+)"
        ], text)

        father = find_match([
            r"Father\s*(?:/|or)?\s*Guardian\s*(?:Name)?\s*:\s*([^\n\r,]+)",
            r"Father\s*Name\s*:\s*([^\n\r,]+)",
            r"Husband\s*Name\s*:\s*([^\n\r,]+)"
        ], text)

        khasra = find_match([
            r"Khasra\s*(?:/|or)?\s*Survey\s*(?:Number|No)?\s*:\s*([^\n\r,]+)",
            r"Khasra\s*(?:Number|No)?\s*:\s*([^\n\r,]+)",
            r"Survey\s*(?:Number|No)?\s*:\s*([^\n\r,]+)"
        ], text)

        khata = find_match([
            r"Khata\s*(?:Number|No)?\s*:\s*([^\n\r,]+)",
            r"Khata\s*:\s*([^\n\r,]+)"
        ], text)

        plot = find_match([
            r"Plot\s*(?:Number|No)?\s*:\s*([^\n\r,]+)",
            r"Plot\s*:\s*([^\n\r,]+)"
        ], text)

        area_str = find_match([
            r"Land\s*Area\s*:\s*([^\n\r,]+)",
            r"Area\s*:\s*([^\n\r,]+)",
            r"Extent\s*:\s*([^\n\r,]+)"
        ], text)

        village = find_match([
            r"Village\s*(?:/|or)?\s*Gram\s*:\s*([^\n\r,]+)",
            r"Village\s*:\s*([^\n\r,]+)",
            r"Gram\s*:\s*([^\n\r,]+)"
        ], text)

        tehsil = find_match([
            r"Tehsil\s*(?:/|or)?\s*Mandal\s*:\s*([^\n\r,]+)",
            r"Tehsil\s*:\s*([^\n\r,]+)",
            r"Mandal\s*:\s*([^\n\r,]+)"
        ], text)

        district = find_match([
            r"District\s*:\s*([^\n\r,]+)"
        ], text)

        state = find_match([
            r"State\s*:\s*([^\n\r,]+)"
        ], text)

        mutation = find_match([
            r"Mutation\s*(?:Record)?\s*(?:Number|No)?\s*:\s*([^\n\r,]+)",
            r"Mutation\s*:\s*([^\n\r,]+)"
        ], text)

        doc_date = find_match([
            r"Registration\s*Date\s*:\s*([^\n\r,]+)",
            r"Document\s*Date\s*:\s*([^\n\r,]+)",
            r"Date\s*:\s*([^\n\r,]+)"
        ], text)

        land_type = find_match([
            r"Land\s*Classification\s*:\s*([^\n\r,]+)",
            r"Land\s*Type\s*:\s*([^\n\r,]+)"
        ], text)

        raw_fields = [
            ("owner_name", "Landowner Name", owner, 95.0),
            ("father_name", "Father/Guardian Name", father, 92.0),
            ("khasra_number", "Khasra / Survey Number", khasra, 90.0),
            ("khata_number", "Khata Number", khata, 90.0),
            ("plot_number", "Plot Number", plot, 88.0),
            ("area", "Land Area", area_str, 91.0),
            ("village", "Village", village, 95.0),
            ("tehsil", "Tehsil / Mandal", tehsil, 95.0),
            ("district", "District", district, 98.0),
            ("state", "State", state, 99.0),
            ("mutation_number", "Mutation Number", mutation, 89.0),
            ("document_date", "Document Date", doc_date, 93.0),
            ("land_type", "Land Type", land_type, 92.0),
        ]

        for key, name, val, base_conf in raw_fields:
            if val is not None:
                conf = base_conf
                status = "high" if conf >= 85.0 else ("medium" if conf >= 60.0 else "low")
            else:
                conf = 0.0
                status = "manual_verification_required"

            fields.append({
                "field_key": key,
                "field_name": name,
                "field_value": val,
                "confidence": conf,
                "status": status,
                "source": "document",
                "is_edited": False,
                "original_value": val,
                "corrected_value": None
            })

        return fields

entity_extractor = EntityExtractor()
