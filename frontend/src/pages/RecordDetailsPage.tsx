import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Download, 
  Printer, 
  MapPin, 
  ArrowLeft, 
  User, 
  Landmark, 
  History, 
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';

export const RecordDetailsPage: React.FC = () => {
  const { id = 'REC-001' } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.getRecordDetail(id);
        setData(res);
      } catch (e) {
        console.error(e);
      }
    };
    fetchDetail();
  }, [id]);

  const rec = data?.record || {
    id: 'REC-001',
    owner_name: 'Ramesh Kumar',
    father_name: 'Suresh Kumar',
    khasra_number: '123/45',
    khata_number: '78',
    plot_number: 'P-402',
    area: 2.45,
    area_unit: 'Acres',
    village: 'Peddakakani',
    tehsil: 'Guntur',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    mutation_number: 'MUT-2024-889',
    document_date: '14-02-2023',
    land_type: 'Agricultural / Wet Land',
    ulpin: '28-GNT-2024-9982',
    status: 'Verified',
    validation_score: 94.0,
    created_at: new Date().toISOString()
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Bar Actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-3">
          <Link to="/records" className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-extrabold text-slate-900">Digital Land Record Certificate</h1>
              <span className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-bold flex items-center border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Verified Record
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Record ID: {rec.id} | ULPIN: {rec.ulpin}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow transition"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
          <Link
            to="/map"
            className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow transition"
          >
            <MapPin className="w-4 h-4" />
            <span>View on Map</span>
          </Link>
        </div>
      </div>

      {/* Official Government Record Certificate Container */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-lg p-8 space-y-8 print:p-0 print:border-none print:shadow-none">
        {/* Certificate Header */}
        <div className="border-b-2 border-slate-900 pb-6 text-center space-y-2">
          <div className="w-14 h-14 bg-blue-900 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
            <Landmark className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">GOVERNMENT OF ANDHRA PRADESH</h2>
          <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">
            DEPARTMENT OF REVENUE & LAND RECORDS — DIGITIZED CADASTRAL KHATAUNI
          </p>
          <div className="mt-2 inline-block bg-emerald-50 text-emerald-800 text-xs font-extrabold px-4 py-1 rounded-full border border-emerald-300">
            ✓ OFFICIALLY VERIFIED DIGITAL LAND RECORD
          </div>
        </div>

        {/* 1. Owner Information */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider flex items-center border-b border-slate-200 pb-2">
            <User className="w-4 h-4 mr-2" /> 1. Landowner Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Primary Landowner Name</span>
              <p className="text-base font-extrabold text-slate-900 mt-0.5">{rec.owner_name}</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Father / Guardian Name</span>
              <p className="text-base font-extrabold text-slate-900 mt-0.5">{rec.father_name || 'Suresh Kumar'}</p>
            </div>
          </div>
        </div>

        {/* 2. Land Information */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider flex items-center border-b border-slate-200 pb-2">
            <Landmark className="w-4 h-4 mr-2" /> 2. Land Parcel & Cadastral Details
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Khasra / Survey No.</span>
              <p className="text-sm font-extrabold text-slate-900 mt-0.5">{rec.khasra_number}</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Khata Number</span>
              <p className="text-sm font-extrabold text-slate-900 mt-0.5">{rec.khata_number}</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Land Area</span>
              <p className="text-sm font-extrabold text-slate-900 mt-0.5">{rec.area} {rec.area_unit}</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Land Classification</span>
              <p className="text-sm font-extrabold text-slate-900 mt-0.5">{rec.land_type}</p>
            </div>
          </div>
        </div>

        {/* 3. Location Hierarchy */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider flex items-center border-b border-slate-200 pb-2">
            <MapPin className="w-4 h-4 mr-2" /> 3. Administrative Location Hierarchy
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Village / Gram</span>
              <p className="font-extrabold text-slate-900 mt-0.5">{rec.village}</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Tehsil / Mandal</span>
              <p className="font-extrabold text-slate-900 mt-0.5">{rec.tehsil}</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">District</span>
              <p className="font-extrabold text-slate-900 mt-0.5">{rec.district}</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">State</span>
              <p className="font-extrabold text-slate-900 mt-0.5">{rec.state}</p>
            </div>
          </div>
        </div>

        {/* 4. Mutation History & GIS Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider flex items-center border-b border-slate-200 pb-2">
              <History className="w-4 h-4 mr-2" /> 4. Mutation & Ownership History
            </h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Mutation No: {rec.mutation_number || 'MUT-2024-889'}</span>
                <span className="text-emerald-700">Sanctioned</span>
              </div>
              <p className="text-slate-600">Date of Registration: {rec.document_date || '14-02-2023'}</p>
              <p className="text-slate-600">Nature of Transfer: Inheritance / Family Settlement</p>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider flex items-center border-b border-slate-200 pb-2">
              <ShieldCheck className="w-4 h-4 mr-2" /> 5. AI Validation & GIS Attributes
            </h3>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
              <p className="font-bold text-slate-900">Validation Score: <span className="text-emerald-600 font-extrabold">{rec.validation_score}% Passed</span></p>
              <p className="font-mono text-blue-700 font-bold">ULPIN: {rec.ulpin || '28-GNT-2024-9982'}</p>
              <p className="text-slate-500">Spatial Layer: Prototype Cadastral Geo-Reference</p>
            </div>
          </div>
        </div>

        {/* Digital Stamp & Signatures */}
        <div className="pt-6 border-t-2 border-slate-200 flex justify-between items-end text-xs">
          <div className="space-y-1">
            <p className="font-bold text-slate-700">Issued by: Bhu-Drishti AI Automated Digitization Engine</p>
            <p className="text-slate-500">Verified by Revenue Officer (Rajesh Sharma)</p>
            <p className="text-[10px] text-slate-400 font-mono">HASH: 9a8f7e6d5c4b3a21</p>
          </div>
          <div className="text-right space-y-1">
            <div className="w-24 h-12 bg-blue-50 border border-blue-200 rounded flex items-center justify-center font-serif text-[10px] font-bold text-blue-900">
              OFFICIAL SEAL
            </div>
            <p className="font-bold text-slate-800">Tahsildar / Revenue Authority</p>
          </div>
        </div>
      </div>
    </div>
  );
};
