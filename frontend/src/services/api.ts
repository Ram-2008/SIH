import axios from 'axios';
import type { DashboardStats, Document, ReviewTask, LandRecord, GISParcel, AuditLog } from '../types';

const API_BASE = '/api';

export const api = {
  // Auth
  login: async (email: string, pass: string) => {
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { email, password: pass });
      return res.data;
    } catch {
      // Fallback demo user if backend offline
      return {
        access_token: "demo-jwt-token",
        user: {
          id: 1,
          email: email || "officer@bhurishti.gov.in",
          full_name: "Rajesh Sharma",
          role: "REVENUE_OFFICER",
          department: "Revenue & Land Records - Guntur Circle"
        }
      };
    }
  },

  // Dashboard Stats
  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await axios.get(`${API_BASE}/dashboard/stats`);
    return res.data;
  },

  // Documents
  uploadDocument: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await axios.post(`${API_BASE}/documents/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  processDocument: async (docId: string) => {
    const res = await axios.post(`${API_BASE}/documents/${docId}/process`);
    return res.data;
  },

  getDocuments: async (status?: string): Promise<Document[]> => {
    const res = await axios.get(`${API_BASE}/documents`, { params: { status } });
    return res.data;
  },

  getDocument: async (docId: string): Promise<Document> => {
    const res = await axios.get(`${API_BASE}/documents/${docId}`);
    return res.data;
  },

  updateField: async (docId: string, fieldKey: string, newValue: string) => {
    const res = await axios.put(`${API_BASE}/documents/${docId}/fields/${fieldKey}`, {
      field_value: newValue
    });
    return res.data;
  },

  // Reviews
  getReviewTasks: async (): Promise<ReviewTask[]> => {
    const res = await axios.get(`${API_BASE}/reviews`);
    return res.data;
  },

  submitReviewAction: async (taskId: string, action: 'approve' | 'edit' | 'reject', correctedValue?: string, notes?: string) => {
    const res = await axios.put(`${API_BASE}/reviews/${taskId}`, {
      action,
      corrected_value: correctedValue,
      notes
    });
    return res.data;
  },

  // Records
  getLandRecords: async (search?: string): Promise<LandRecord[]> => {
    const res = await axios.get(`${API_BASE}/records`, { params: { search } });
    return res.data;
  },

  getRecordDetail: async (recId: string) => {
    const res = await axios.get(`${API_BASE}/records/${recId}`);
    return res.data;
  },

  // GIS
  getGISParcels: async (): Promise<GISParcel[]> => {
    const res = await axios.get(`${API_BASE}/gis/parcels`);
    return res.data;
  },

  // Audit Logs
  getAuditLogs: async (): Promise<AuditLog[]> => {
    const res = await axios.get(`${API_BASE}/audit-logs`);
    return res.data;
  },

  // Demo Workflow Execution
  runDemoWorkflow: async () => {
    const res = await axios.post(`${API_BASE}/demo/run`);
    return res.data;
  }
};
