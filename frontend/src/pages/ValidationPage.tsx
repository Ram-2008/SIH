import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowLeft, 
  Building2
} from 'lucide-react';
import { api } from '../services/api';
import type { ValidationCheck } from '../types';

export const ValidationPage: React.FC = () => {
  const { id = 'DOC-101' } = useParams<{ id: string }>();

  const defaultChecks: ValidationCheck[] = [
    { category: 'DOCUMENT VALIDATION', check_name: 'Document Date Format', status: 'valid', message: 'Document date (14-02-2023) is properly formatted.', score: 100 },
    { category: 'ENTITY VALIDATION', check_name: 'Khasra Number Format', status: 'warning', message: "Khasra number '12/45' has low OCR confidence or non-standard format.", score: 75 },
    { category: 'AREA VALIDATION', check_name: 'Land Area Positive & Valid', status: 'valid', message: 'Area value (2.45 Acres) is positive and in recognized unit.', score: 100 },
    { category: 'DUPLICATE CHECK', check_name: 'Duplicate Khasra Audit', status: 'valid', message: 'No duplicate record found in regional revenue ledger.', score: 100 },
    { category: 'OWNERSHIP CHECK', check_name: 'Landowner Lineage Verification', status: 'warning', message: 'Ownership information requires verification against Tahsildar Registry.', score: 85 },
    { category: 'GIS VALIDATION', check_name: 'Cadastral Geo-Reference', status: 'valid', message: 'Parcel geometry successfully matched with spatial layer (ULPIN: 28-GNT-2024-9982).', score: 100 }
  ];

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        await api.getDocument(id);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDoc();
  }, [id]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <Link to={`/extraction/${id}`} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Automated Validation Engine</h1>
            <p className="text-xs text-slate-500">Business rules, duplicate checks, area sanity, and spatial alignment</p>
          </div>
        </div>

        {/* Overall Score Badge */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white px-5 py-3 rounded-xl shadow-md flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center font-extrabold text-lg text-emerald-300">
            94%
          </div>
          <div>
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">Overall Validation Score</div>
            <div className="text-xs text-emerald-400 font-semibold flex items-center mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Passed with 2 Officer Warnings
            </div>
          </div>
        </div>
      </div>

      {/* Validation Categories Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {defaultChecks.map((check, idx) => {
          const isValid = check.status === 'valid';
          const isWarning = check.status === 'warning';
          const isError = check.status === 'error';

          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-all ${
                isValid
                  ? 'bg-white border-emerald-200 shadow-sm'
                  : isWarning
                  ? 'bg-amber-50/50 border-amber-300 shadow-sm'
                  : 'bg-rose-50/50 border-rose-300 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {check.category}
                </span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex items-center ${
                  isValid
                    ? 'bg-emerald-100 text-emerald-800'
                    : isWarning
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {isValid && <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />}
                  {isWarning && <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />}
                  {isError && <XCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />}
                  {check.status.toUpperCase()} ({check.score}%)
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm mt-3">{check.check_name}</h3>
              <p className="text-xs text-slate-600 mt-1 font-medium">{check.message}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-900 text-slate-300 p-5 rounded-2xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building2 className="w-5 h-5 text-blue-400" />
          <span className="text-xs font-semibold">
            Validation rules synced with National Generic Document Registration System (NGDRS) standards.
          </span>
        </div>
        <Link
          to="/review"
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition"
        >
          Proceed to Human Review Queue &rarr;
        </Link>
      </div>
    </div>
  );
};
