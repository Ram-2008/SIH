import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  FileText, 
  CheckCircle2, 
  Edit3, 
  Save, 
  ShieldCheck, 
  ArrowLeft,
  Eye,
  Sparkles,
  Languages,
  Columns
} from 'lucide-react';
import { api } from '../services/api';
import type { Document, ExtractedField } from '../types';

export const ExtractionPage: React.FC = () => {
  const { id = 'DOC-101' } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<Document | null>(null);
  const [fields, setFields] = useState<ExtractedField[]>([]);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const [viewMode, setViewMode] = useState<'sideBySide' | 'scanOnly' | 'translatedOnly'>('sideBySide');
  const [showDebug, setShowDebug] = useState<boolean>(true);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const res = await api.getDocument(id);
        setDoc(res);
        setFields(res.fields || []);
      } catch (err) {
        console.error("Fetch document error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  const handleEditClick = (field: ExtractedField) => {
    setEditingKey(field.field_key);
    setEditValue(field.field_value || '');
  };

  const handleSaveField = async (fieldKey: string) => {
    try {
      await api.updateField(id, fieldKey, editValue);
      setFields(prev => prev.map(f => {
        if (f.field_key === fieldKey) {
          return {
            ...f,
            field_value: editValue,
            confidence: 100.0,
            status: 'high',
            is_edited: true,
            corrected_value: editValue
          };
        }
        return f;
      }));
      setEditingKey(null);
      setSavedMessage("Correction saved — Active Learning model feedback updated!");
      setTimeout(() => setSavedMessage(null), 4000);
    } catch (e) {
      console.error("Save field error:", e);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 font-medium">
        <Sparkles className="w-6 h-6 animate-spin mr-2 text-blue-600" /> Translating & Inspecting Land Document...
      </div>
    );
  }

  const documentImageSrc = doc?.file_path
    ? `/${doc.file_path.replace(/\\/g, '/')}`
    : '/sample-data/documents/sample_khasra_record.jpg';

  const isPdf = doc?.filename?.toLowerCase().endsWith('.pdf') || doc?.mime_type?.includes('pdf');
  const detectedLanguage = doc?.detected_language || "Telugu (తెలుగు)";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center space-x-3">
          <Link to="/" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-slate-900">Multilingual Extraction & Verification: {doc?.id || id}</h1>
              <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                Avg Confidence: {doc?.confidence_score || 0}%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Scanned Document ({doc?.filename}) | Language: <strong className="text-blue-700">{detectedLanguage}</strong>
            </p>
          </div>
        </div>

        {/* Action Controls & Debug Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center space-x-1 ${
              showDebug
                ? 'bg-slate-900 text-amber-300 border-slate-700 shadow'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{showDebug ? 'Hide Developer Debug Panel' : 'Developer Debug Mode'}</span>
          </button>
          
          <div className="flex items-center space-x-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setViewMode('sideBySide')}
              className={`px-3 py-1 rounded-lg font-bold transition flex items-center space-x-1 ${
                viewMode === 'sideBySide' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Dual View</span>
            </button>
            <button
              onClick={() => setViewMode('scanOnly')}
              className={`px-3 py-1 rounded-lg font-bold transition flex items-center space-x-1 ${
                viewMode === 'scanOnly' ? 'bg-blue-600 text-white shadow' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Scan Only</span>
            </button>
          </div>
        </div>
      </div>

      {/* Registry Source Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
          <span>Land Record Data Source:</span>
          <span className="bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-md font-mono text-[11px]">
            {doc?.registry_source_label || "DEMO DATA — NOT GOVERNMENT RECORDS"}
          </span>
        </div>
        <span className="text-[11px] font-semibold text-slate-500">
          Cross-referenced against registry database schema
        </span>
      </div>

      {savedMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{savedMessage}</span>
          </div>
          <span className="text-xs font-bold text-emerald-700 uppercase bg-emerald-100 px-2 py-0.5 rounded">Active Learning</span>
        </div>
      )}

      {/* Side-by-Side Dual View Layout */}
      <div className={`grid grid-cols-1 ${viewMode === 'sideBySide' ? 'lg:grid-cols-12' : ''} gap-6`}>
        {/* LEFT SECTION: Original Document Scan & Native Script OCR */}
        {(viewMode === 'sideBySide' || viewMode === 'scanOnly') && (
          <div className={`${viewMode === 'sideBySide' ? 'lg:col-span-6' : 'w-full'} bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col`}>
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-xs uppercase tracking-wider">Original Document Scan ({detectedLanguage})</span>
              </div>
              <span className="text-[10px] bg-slate-800 px-2.5 py-0.5 rounded text-amber-300 font-mono font-bold">
                Source: Document (OCR)
              </span>
            </div>
            
            <div className="p-4 flex-1 flex flex-col items-center justify-center bg-slate-950/95 min-h-[500px]">
              {!imgError && !isPdf ? (
                <div className="relative border-4 border-slate-800 rounded-xl overflow-hidden shadow-2xl bg-white max-w-full">
                  <img
                    src={documentImageSrc}
                    alt={doc?.filename || "Uploaded Regional Land Document Scan"}
                    onError={() => setImgError(true)}
                    className="max-h-[580px] w-auto object-contain"
                  />
                </div>
              ) : (
                <div className="w-full h-[520px] bg-slate-900 rounded-xl p-6 flex flex-col text-slate-200 text-xs space-y-4 overflow-y-auto font-serif leading-relaxed">
                  <div className="border-b border-slate-700 pb-3 flex justify-between items-center">
                    <span className="font-bold text-blue-400 text-sm">Native Script Text Extraction ({detectedLanguage})</span>
                    <span className="bg-amber-900/60 text-amber-300 text-[10px] px-2 py-0.5 rounded">Regional Language</span>
                  </div>
                  <pre className="whitespace-pre-wrap font-serif text-slate-300 text-xs bg-slate-950 p-4 rounded-lg border border-slate-800">
                    {doc?.original_text || "No OCR text extracted"}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* RIGHT SECTION: Field Extraction with Source & Registry Comparison */}
        {(viewMode === 'sideBySide' || viewMode === 'translatedOnly') && (
          <div className={`${viewMode === 'sideBySide' ? 'lg:col-span-6' : 'w-full'} bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5`}>
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-extrabold text-slate-900 text-base flex items-center">
                  <Languages className="w-4 h-4 text-blue-600 mr-2" />
                  Land Data Extraction & Registry Verification
                </h2>
                <p className="text-xs text-slate-500">Field-by-field attribution (OCR vs Land Registry API)</p>
              </div>
              <div className="flex space-x-1.5 text-[10px] font-bold">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded border border-emerald-300">MATCH 🟢</span>
                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded border border-rose-300">MISMATCH 🔴</span>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded border border-amber-300">REVIEW 🟠</span>
              </div>
            </div>

            {/* Extracted Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map((field) => {
                const isLowConf = field.confidence < 85.0 || field.field_value === null;
                const isEditing = editingKey === field.field_key;
                const res = field.comparison_result || 'NEEDS_REVIEW';

                let resBadgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
                if (res === 'MATCH') resBadgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                if (res === 'MISMATCH') resBadgeClass = 'bg-rose-100 text-rose-800 border-rose-300';
                if (res === 'NOT_AVAILABLE') resBadgeClass = 'bg-slate-100 text-slate-700 border-slate-300';

                return (
                  <div
                    key={field.field_key}
                    className={`p-3.5 rounded-xl border transition-all ${
                      res === 'MISMATCH'
                        ? 'border-rose-300 bg-rose-50/40 shadow-sm ring-1 ring-rose-400/30'
                        : isLowConf
                        ? 'border-amber-300 bg-amber-50/40 shadow-sm ring-1 ring-amber-400/30'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">{field.field_name}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${resBadgeClass}`}>
                        {res}
                      </span>
                    </div>

                    {/* Source & Confidence row */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold mb-1.5">
                      <span>Source: <strong className="text-slate-600">{field.source || 'document'}</strong></span>
                      <span>Confidence: <strong className="text-blue-700">{field.confidence}%</strong></span>
                    </div>

                    {isEditing ? (
                      <div className="mt-2 flex items-center space-x-2">
                        <input
                          type="text"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full text-xs font-bold text-slate-900 px-3 py-1.5 border border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-600 bg-white"
                        />
                        <button
                          onClick={() => handleSaveField(field.field_key)}
                          className="bg-blue-600 text-white p-2 rounded-lg font-bold text-xs hover:bg-blue-700 transition"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {/* Extracted OCR Value */}
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Document OCR:</span>
                            <span className="text-xs font-extrabold text-slate-900">
                              {field.field_value !== null ? field.field_value : <em className="text-amber-700 font-normal">Unable to confidently extract</em>}
                            </span>
                          </div>
                          <button
                            onClick={() => handleEditClick(field)}
                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1 hover:bg-blue-50 px-1.5 py-0.5 rounded"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                        </div>

                        {/* Land Registry API Retrieved Value */}
                        <div className="bg-slate-100/80 p-1.5 rounded-md text-[11px] mt-1">
                          <span className="text-[9px] text-slate-500 uppercase font-bold block">Registry Record:</span>
                          <span className="font-bold text-blue-900">
                            {field.registry_value !== null ? field.registry_value : <em className="text-slate-400 font-normal">No registry value</em>}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Bottom Action Footer */}
            <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
              <Link
                to={`/validation/${id}`}
                className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Run Validation Engine</span>
              </Link>
              <Link
                to={`/records/${id}`}
                className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition"
              >
                <FileText className="w-4 h-4" />
                <span>Generate Verified Certificate</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* DEVELOPER DEBUG MODE PANEL */}
      {showDebug && doc?.debug_info && (
        <div className="bg-slate-950 text-slate-100 p-6 rounded-2xl border border-slate-800 shadow-2xl space-y-6 font-mono text-xs">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping"></span>
              <h3 className="text-sm font-bold text-amber-400 tracking-wider uppercase">
                Developer Debug Mode (DEBUG_MODE=true)
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1 rounded-md">
              Sanitized Telemetry — No secrets logged
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Uploaded File & Request Params */}
            <div className="space-y-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-amber-400 font-bold block mb-1">1. Uploaded Filename:</span>
                <span className="text-white bg-slate-950 p-2 rounded block">{doc.debug_info.uploaded_filename}</span>
              </div>
              <div>
                <span className="text-amber-400 font-bold block mb-1">4. OCR Confidence Score:</span>
                <span className="text-emerald-400 bg-slate-950 p-2 rounded block">{doc.debug_info.ocr_confidence}%</span>
              </div>
              <div>
                <span className="text-amber-400 font-bold block mb-1">5. API Request Parameters:</span>
                <pre className="text-slate-300 bg-slate-950 p-3 rounded text-[11px] overflow-x-auto">
                  {JSON.stringify(doc.debug_info.api_request_parameters, null, 2)}
                </pre>
              </div>
              <div>
                <span className="text-amber-400 font-bold block mb-1">6. API HTTP Status:</span>
                <span className="text-blue-400 bg-slate-950 p-2 rounded block">{doc.debug_info.api_http_status} OK</span>
              </div>
            </div>

            {/* Column 2: Raw & Normalized API Response */}
            <div className="space-y-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-amber-400 font-bold block mb-1">7. API Response (Raw):</span>
                <pre className="text-slate-300 bg-slate-950 p-3 rounded text-[10px] h-36 overflow-y-auto">
                  {JSON.stringify(doc.debug_info.api_response, null, 2)}
                </pre>
              </div>
              <div>
                <span className="text-amber-400 font-bold block mb-1">8. Normalized API Response:</span>
                <pre className="text-slate-300 bg-slate-950 p-3 rounded text-[10px] h-40 overflow-y-auto">
                  {JSON.stringify(doc.debug_info.normalized_api_response, null, 2)}
                </pre>
              </div>
            </div>

            {/* Column 3: OCR Raw Text & Extracted JSON */}
            <div className="space-y-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-amber-400 font-bold block mb-1">2. OCR Raw Text:</span>
                <div className="text-slate-300 bg-slate-950 p-3 rounded text-[10px] h-36 overflow-y-auto whitespace-pre-wrap">
                  {doc.debug_info.ocr_raw_text}
                </div>
              </div>
              <div>
                <span className="text-amber-400 font-bold block mb-1">3. Extracted JSON:</span>
                <pre className="text-slate-300 bg-slate-950 p-3 rounded text-[10px] h-40 overflow-y-auto">
                  {JSON.stringify(doc.debug_info.extracted_json, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {/* Comparison Matrix Table */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
            <span className="text-amber-400 font-bold block mb-3">9. Comparison Matrix:</span>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[11px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="p-2">Field</th>
                    <th className="p-2">OCR Value</th>
                    <th className="p-2">Normalized OCR</th>
                    <th className="p-2">Registry Value</th>
                    <th className="p-2">Normalized Registry</th>
                    <th className="p-2">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {doc.debug_info.comparison_result?.map((row, idx) => (
                    <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/40">
                      <td className="p-2 font-bold text-white">{row.field_name}</td>
                      <td className="p-2 text-slate-300">{row.ocr_value || 'null'}</td>
                      <td className="p-2 text-slate-400">{row.normalized_ocr || 'null'}</td>
                      <td className="p-2 text-slate-300">{row.registry_value || 'null'}</td>
                      <td className="p-2 text-slate-400">{row.normalized_registry || 'null'}</td>
                      <td className="p-2 font-bold">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${
                          row.comparison_result === 'MATCH'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : row.comparison_result === 'MISMATCH'
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}>
                          {row.comparison_result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
