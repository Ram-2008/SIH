import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { api } from '../services/api';
import type { AuditLog } from '../types';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.getAuditLogs();
        setLogs(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">System Audit Trail & Event Logs</h1>
          <p className="text-xs text-slate-500 mt-1">
            Immutable log of document uploads, OpenCV pre-processing, OCR extractions, and officer edits
          </p>
        </div>
        <span className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-lg font-bold border border-blue-200">
          Compliance Log Active
        </span>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 text-base">Audit Trail Timeline</h3>
          <span className="text-xs text-slate-500 font-medium">{logs.length} Log Entries Recorded</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            <Sparkles className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" /> Loading Audit Trail...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">User / System</th>
                  <th className="py-3.5 px-4">Action Performed</th>
                  <th className="py-3.5 px-4">Document ID</th>
                  <th className="py-3.5 px-4">Field Changed</th>
                  <th className="py-3.5 px-4">Old Value &rarr; New Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {log.user_name}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-blue-900 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                      {log.document_id || 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {log.field_changed || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      {log.old_value || log.new_value ? (
                        <div className="flex items-center space-x-1.5 font-mono text-[11px]">
                          <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">{log.old_value || 'None'}</span>
                          <span>&rarr;</span>
                          <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">{log.new_value}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-sans">{log.details || 'System event'}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
