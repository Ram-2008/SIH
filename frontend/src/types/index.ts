export interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  department: string;
}

export interface ExtractedField {
  id?: number;
  field_key: string;
  field_name: string;
  field_value: string | null;
  original_script_value?: string;
  confidence: number;
  status: 'high' | 'medium' | 'low' | 'manual_verification_required';
  source?: string;
  normalized_value?: string | null;
  registry_value?: string | null;
  registry_source?: string | null;
  comparison_result?: 'MATCH' | 'MISMATCH' | 'NOT_AVAILABLE' | 'NEEDS_REVIEW';
  is_edited: boolean;
  original_value?: string;
  corrected_value?: string;
}

export interface ValidationCheck {
  category: string;
  check_name: string;
  status: 'valid' | 'warning' | 'error';
  message: string;
  score: number;
}

export interface ReviewTask {
  id: string;
  document_id: string;
  field_key: string;
  field_name: string;
  extracted_value: string;
  confidence: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Corrected' | 'Rejected';
  assigned_to: string;
  reviewed_by?: string;
  reviewed_at?: string;
  correction_notes?: string;
}

export interface LandRecord {
  id: string;
  document_id: string;
  owner_name: string;
  father_name: string;
  khasra_number: string;
  khata_number: string;
  plot_number: string;
  area: number;
  area_unit: string;
  village: string;
  tehsil: string;
  district: string;
  state: string;
  mutation_number: string;
  document_date: string;
  land_type: string;
  ulpin: string;
  status: string;
  validation_score: number;
  created_at: string;
}

export interface Document {
  id: string;
  filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  status: string;
  confidence_score: number;
  uploaded_by: string;
  detected_language?: string;
  original_text?: string;
  translated_text?: string;
  registry_source_label?: string;
  debug_info?: {
    uploaded_filename?: string;
    ocr_raw_text?: string;
    extracted_json?: any;
    ocr_confidence?: number;
    api_request_parameters?: any;
    api_http_status?: number;
    api_response?: any;
    normalized_api_response?: any;
    comparison_result?: Array<{
      field_key: string;
      field_name: string;
      ocr_value: string | null;
      registry_value: string | null;
      comparison_result: string;
      normalized_ocr: string | null;
      normalized_registry: string | null;
    }>;
  };
  created_at: string;
  fields?: ExtractedField[];
  land_record?: LandRecord;
}

export interface AuditLog {
  id: number;
  document_id?: string;
  user_name: string;
  action: string;
  field_changed?: string;
  old_value?: string;
  new_value?: string;
  timestamp: string;
  details?: string;
}

export interface GISParcel {
  id: string;
  ulpin: string;
  owner_name: string;
  khasra_number: string;
  village: string;
  district: string;
  area: number;
  land_type: string;
  coordinates_json: string;
  center_lat: number;
  center_lng: number;
  status: string;
}

export interface DashboardStats {
  total_documents: number;
  processed_records: number;
  pending_reviews: number;
  validation_issues: number;
  high_confidence_records: number;
  avg_confidence: number;
  documents_trend: Array<{ period: string; uploaded: number; processed: number; verified: number }>;
  validation_status_breakdown: Array<{ name: string; value: number; color: string }>;
  confidence_distribution: Array<{ range: string; count: number; fill: string }>;
}
