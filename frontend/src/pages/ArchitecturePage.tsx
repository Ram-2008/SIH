import React from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';

export const ArchitecturePage: React.FC = () => {
  const activeComponents = [
    { name: 'OpenCV Preprocessing Engine', desc: 'Deskewing, bilateral filtering, CLAHE contrast enhancement, Otsu binarization.', status: 'Active 🟢' },
    { name: 'Tesseract & Fallback OCR Engine', desc: 'Multilingual document text extraction pipeline.', status: 'Active 🟢' },
    { name: 'Regex & Rule Entity Extractor', desc: 'Extracts Owner, Khasra, Khata, Area, Tehsil, District, State fields.', status: 'Active 🟢' },
    { name: 'Business Rule Validation Service', desc: '6-point sanity checks for land records.', status: 'Active 🟢' },
    { name: 'Human-in-the-Loop Active Learning', desc: 'Officer review queue with real-time feedback loop.', status: 'Active 🟢' },
    { name: 'PostgreSQL / SQLite Database Layer', desc: 'SQLAlchemy models & audit trail logging.', status: 'Active 🟢' },
  ];

  const integrationReadyModules = [
    { name: 'TrOCR (Transformer OCR)', desc: 'End-to-end handwriting recognition for legacy cursive scripts.', status: 'Integration Ready 🔵' },
    { name: 'LayoutLMv3 (Document AI)', desc: 'Multimodal document structural layout understanding.', status: 'Integration Ready 🔵' },
    { name: 'IndicNLP Engine', desc: 'Native script translation & normalization (Hindi, Telugu, Tamil, Bengali).', status: 'Integration Ready 🔵' },
    { name: 'YOLOv8 / Detectron2 Parcel Segmentor', desc: 'Automated extraction of cadastral map boundary lines.', status: 'Integration Ready 🔵' },
    { name: 'PostGIS Spatial Extension', desc: 'Native PostGIS polygon spatial querying.', status: 'Integration Ready 🔵' },
    { name: 'ULPIN & DILRMP API Connector', desc: 'Direct sync with Digital India Land Records Modernization Programme.', status: 'Integration Ready 🔵' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">Future-Ready Platform Architecture</h1>
          <p className="text-xs text-slate-300 mt-1">
            Bhu-Drishti AI modular pipeline architecture & enterprise integration roadmap
          </p>
        </div>
        <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-lg font-bold">
          SIH Prototype v1.0
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Pipeline */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center border-b border-slate-100 pb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-2" />
            Currently Active MVP Pipeline
          </h2>

          <div className="space-y-3">
            {activeComponents.map((c, idx) => (
              <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-xs">{c.name}</span>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Integration Ready Modules */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h2 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center border-b border-slate-100 pb-3">
            <Sparkles className="w-5 h-5 text-blue-600 mr-2" />
            Integration Ready Architecture Modules
          </h2>

          <div className="space-y-3">
            {integrationReadyModules.map((c, idx) => (
              <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-900 text-xs">{c.name}</span>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
