import axios from 'axios';
import { ApiResponse, Client, DashboardStats, AuditLog, Settings } from '../types';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const clientApi = {
  // Auth
  login: (username: string, password: string) =>
    api.post<ApiResponse<{ token: string; user: any }>>('/auth/login', { username, password }),

  logout: () => api.post('/auth/logout'),

  // Dashboard
  getStats: () => api.get<ApiResponse<DashboardStats>>('/dashboard/stats'),

  // Clients
  getClients: (params?: any) => api.get<ApiResponse<Client[]>>('/clients', { params }),
  getClient: (id: string) => api.get<ApiResponse<Client>>(`/clients/${id}`),
  createClient: (data: Partial<Client>) => api.post<ApiResponse<Client>>('/clients', data),
  updateClient: (id: string, data: Partial<Client>) =>
    api.put<ApiResponse<Client>>(`/clients/${id}`, data),
  deleteClient: (id: string) => api.delete<ApiResponse>(`/clients/${id}`),
  activateClient: (id: string) => api.post<ApiResponse>(`/clients/${id}/activate`),
  deactivateClient: (id: string) => api.post<ApiResponse>(`/clients/${id}/deactivate`),
  resetClient: (id: string) => api.post<ApiResponse>(`/clients/${id}/reset`),
  regenerateUrl: (id: string) => api.post<ApiResponse<{ url: string }>>(`/clients/${id}/regenerate-url`),
  regenerateQR: (id: string) => api.post<ApiResponse>(`/clients/${id}/regenerate-qr`),

  // Client Sessions
  getClientSession: (clientId: string) =>
    api.get<ApiResponse<any>>(`/clients/${clientId}/session`),

  // Audit Log
  getAuditLogs: (params?: any) => api.get<ApiResponse<AuditLog[]>>('/audit-logs', { params }),

  // Settings
  getSettings: () => api.get<ApiResponse<Settings>>('/settings'),
  updateSettings: (data: Partial<Settings>) => api.put<ApiResponse<Settings>>('/settings', data),
};

export default api;
