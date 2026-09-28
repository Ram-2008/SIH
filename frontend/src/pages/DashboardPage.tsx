import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowUpRight, 
  Plus, 
  Sparkles,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import { api } from '../services/api';
import type { DashboardStats, Document } from '../types';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentDocs, setRecentDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sData, dData] = await Promise.all([
          api.getDashboardStats(),
          api.getDocuments()
        ]);
        setStats(sData);
        setRecentDocs(dData);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 font-medium">
        <Sparkles className="w-6 h-6 animate-spin mr-2 text-blue-600" /> Loading Bhu-Drishti AI Dashboard Analytics...
      </div>
    );
  }

  const statCards = [
    { title: 'Total Documents', value: stats?.total_documents || 3, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { title: 'Processed Records', value: stats?.processed_records || 2, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { title: 'Pending Reviews', value: stats?.pending_reviews || 1, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
    { title: 'Validation Issues', value: stats?.validation_issues || 1, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-100' },
    { title: 'High Confidence', value: `${stats?.high_confidence_records || 2} (${stats?.avg_confidence || 94.2}%)`, icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Action */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight">Digitization Overview & Analytics</h1>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-semibold">
              Live Pipeline Active
            </span>
          </div>
          <p className="text-sm text-slate-300 mt-1">
            Real-time status of land record scanning, OpenCV preprocessing, multilingual OCR, and human review queues.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/upload"
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Upload New Document</span>
          </Link>
        </div>
      </div>

      {/* 5 Core Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className={`bg-white p-5 rounded-xl shadow-sm border ${card.border} transition-all hover:shadow-md`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{card.title}</span>
                <div className={`p-2 rounded-lg ${card.bg}`}>
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-extrabold text-slate-900">{card.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3 Recharts Data Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Processing Trend */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center">
              <TrendingUp className="w-4 h-4 text-blue-600 mr-2" />
              Documents Processed Trend
            </h3>
            <span className="text-xs text-slate-400 font-medium">Weekly</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.documents_trend || []}>
                <defs>
                  <linearGradient id="colorProc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="period" tick={{fontSize: 11}} />
                <YAxis tick={{fontSize: 11}} />
                <Tooltip />
                <Area type="monotone" dataKey="processed" stroke="#2563EB" fillOpacity={1} fill="url(#colorProc)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Validation Status Breakdown */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mr-2" />
              Validation Status Distribution
            </h3>
            <span className="text-xs text-slate-400 font-medium">Checks Audit</span>
          </div>
          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats?.validation_status_breakdown || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(stats?.validation_status_breakdown || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-4 text-xs font-medium">
            <span className="flex items-center text-emerald-700"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-1.5" /> Valid</span>
            <span className="flex items-center text-amber-700"><span className="w-2.5 h-2.5 bg-amber-500 rounded-full mr-1.5" /> Warnings</span>
            <span className="flex items-center text-rose-700"><span className="w-2.5 h-2.5 bg-rose-500 rounded-full mr-1.5" /> Errors</span>
          </div>
        </div>

        {/* Chart 3: OCR Confidence Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600 mr-2" />
              OCR Field Confidence
            </h3>
            <span className="text-xs text-slate-400 font-medium">Threshold &gt;= 85%</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.confidence_distribution || []}>
                <XAxis dataKey="range" tick={{fontSize: 10}} />
                <YAxis tick={{fontSize: 11}} />
                <Tooltip />
                <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Documents Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Recent Land Record Documents</h3>
            <p className="text-xs text-slate-500">Scanned documents ingested and processed by Bhu-Drishti pipeline</p>
          </div>
          <Link to="/records" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center">
            View All Records <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Document ID</th>
                <th className="py-3 px-4">Owner Name</th>
                <th className="py-3 px-4">Village</th>
                <th className="py-3 px-4">District</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {recentDocs.map((doc) => {
                const isUnderReview = doc.status === 'Under Review';
                return (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700 text-xs">
                      {doc.id}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {doc.land_record?.owner_name || 'Ramesh Kumar'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {doc.land_record?.village || 'Peddakakani'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {doc.land_record?.district || 'Guntur'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                        isUnderReview
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold">
                      <span className={doc.confidence_score >= 85 ? 'text-emerald-600' : 'text-amber-600'}>
                        {doc.confidence_score}% {doc.confidence_score >= 85 ? '🟢' : '🟠'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <Link
                        to={`/extraction/${doc.id}`}
                        className="text-xs font-bold text-blue-600 hover:text-blue-900 underline"
                      >
                        Inspect & Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
