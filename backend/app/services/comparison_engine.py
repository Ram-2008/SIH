import re
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger("bhu_drishti_comparison")

class ComparisonEngine:
    """
    Field-by-Field Verification Comparison Engine.
    Compares Document OCR extracted fields vs Government Land Registry API/DB data.
    Produces: MATCH, MISMATCH, NOT_AVAILABLE, NEEDS_REVIEW.
    """

    def normalize_value(self, val: Optional[str]) -> str:
        if not val or val.strip().lower() in ["none", "null", "n/a", "not_available", ""]:
            return ""
        # Trim, lowercase, remove extra spaces and punctuation for string comparison
        cleaned = val.strip().lower()
        cleaned = re.sub(r"\s+", " ", cleaned)
        cleaned = re.sub(r"\s*([/\-])\s*", r"\1", cleaned) # "157 / 23" -> "157/23"
        return cleaned

    def compare_field(
        self,
        field_key: str,
        doc_value: Optional[str],
        doc_conf: float,
        registry_value: Optional[str]
    ) -> Dict[str, Any]:
        """Compares single document field against registry field."""
        norm_doc = self.normalize_value(doc_value)
        norm_reg = self.normalize_value(registry_value)

        # 1. Low Confidence or Unreadable OCR -> NEEDS_REVIEW
        if doc_conf < 85.0 or not doc_value:
            if not doc_value and not registry_value:
                res_status = "NOT_AVAILABLE"
            else:
                res_status = "NEEDS_REVIEW"
        # 2. Missing in Registry API -> NOT_AVAILABLE / NEEDS_REVIEW
        elif not registry_value:
            res_status = "NOT_AVAILABLE"
        # 3. Normalized Match -> MATCH
        elif norm_doc == norm_reg:
            res_status = "MATCH"
        # Special area check: e.g. "2.45 Acres" vs "2.45"
        elif field_key in ["area", "land_area"]:
            m_doc = re.search(r"(\d+(?:\.\d+)?)", norm_doc)
            m_reg = re.search(r"(\d+(?:\.\d+)?)", norm_reg)
            if m_doc and m_reg and abs(float(m_doc.group(1)) - float(m_reg.group(1))) < 0.01:
                res_status = "MATCH"
            else:
                res_status = "MISMATCH"
        # 4. Values differ -> MISMATCH
        else:
            res_status = "MISMATCH"

        logger.info(f"[COMPARISON] Field '{field_key}': Doc='{doc_value}', Reg='{registry_value}' -> Result: {res_status}")

        return {
            "result": res_status,
            "doc_original": doc_value,
            "doc_normalized": norm_doc,
            "registry_original": registry_value,
            "registry_normalized": norm_reg
        }

    def compare_all(
        self,
        doc_fields: Dict[str, Dict[str, Any]],
        registry_fields: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Executes full field-by-field comparison matrix."""
        results = {}
        matched_count = 0
        mismatched_count = 0
        review_count = 0
        not_avail_count = 0

        for key, f_info in doc_fields.items():
            doc_val = f_info.get("value")
            doc_conf = f_info.get("confidence", 90.0)
            reg_val = registry_fields.get(key) or registry_fields.get("khasra_number" if key == "khasra_number" else key)

            cmp_res = self.compare_field(key, doc_val, doc_conf, reg_val)
            results[key] = cmp_res

            res = cmp_res["result"]
            if res == "MATCH":
                matched_count += 1
            elif res == "MISMATCH":
                mismatched_count += 1
            elif res == "NEEDS_REVIEW":
                review_count += 1
            else:
                not_avail_count += 1

        total = len(doc_fields)
        overall_match_percentage = round((matched_count / total) * 100, 1) if total > 0 else 0.0

        return {
            "overall_match_percentage": overall_match_percentage,
            "summary": {
                "matched": matched_count,
                "mismatched": mismatched_count,
                "needs_review": review_count,
                "not_available": not_avail_count
            },
            "fields": results
        }

    def compare_records(
        self,
        extracted_fields: list,
        normalized_registry: Dict[str, Any]
    ) -> list:
        """
        Compares list of extracted field dicts against normalized registry record dict.
        Returns list of updated field dicts with comparison results.
        """
        compared = []
        # Key mapping between extraction keys and normalized registry keys
        key_map = {
            "khasra_number": "survey_number",
            "tehsil": "mandal",
            "area": "land_area"
        }

        for f in extracted_fields:
            key = f["field_key"]
            reg_key = key_map.get(key, key)
            doc_val = f.get("field_value")
            doc_conf = f.get("confidence", 90.0)
            reg_val = normalized_registry.get(reg_key) if normalized_registry else None

            cmp_res = self.compare_field(key, doc_val, doc_conf, reg_val)

            item = dict(f)
            item["normalized_value"] = cmp_res["doc_normalized"]
            item["registry_value"] = reg_val
            item["normalized_registry_value"] = cmp_res["registry_normalized"]
            item["comparison_result"] = cmp_res["result"]
            compared.append(item)

        return compared

comparison_engine = ComparisonEngine()
