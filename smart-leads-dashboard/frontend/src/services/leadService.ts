import api from './api';
import {
  ApiResponse,
  Lead,
  LeadFilters,
  LeadStats,
  CreateLeadData,
  UpdateLeadData,
} from '../types';

export const leadService = {
  getLeads: async (
    filters: Partial<LeadFilters>
  ): Promise<ApiResponse<{ leads: Lead[] }>> => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.source) params.set('source', filters.source);
    if (filters.search) params.set('search', filters.search);
    if (filters.sort) params.set('sort', filters.sort);
    if (filters.page) params.set('page', String(filters.page));
    params.set('limit', '10');

    const { data } = await api.get<ApiResponse<{ leads: Lead[] }>>(
      `/leads?${params.toString()}`
    );
    return data;
  },

  getLeadById: async (id: string): Promise<ApiResponse<{ lead: Lead }>> => {
    const { data } = await api.get<ApiResponse<{ lead: Lead }>>(`/leads/${id}`);
    return data;
  },

  createLead: async (
    payload: CreateLeadData
  ): Promise<ApiResponse<{ lead: Lead }>> => {
    const { data } = await api.post<ApiResponse<{ lead: Lead }>>('/leads', payload);
    return data;
  },

  updateLead: async (
    id: string,
    payload: UpdateLeadData
  ): Promise<ApiResponse<{ lead: Lead }>> => {
    const { data } = await api.put<ApiResponse<{ lead: Lead }>>(
      `/leads/${id}`,
      payload
    );
    return data;
  },

  deleteLead: async (id: string): Promise<ApiResponse> => {
    const { data } = await api.delete<ApiResponse>(`/leads/${id}`);
    return data;
  },

  getStats: async (): Promise<ApiResponse<LeadStats>> => {
    const { data } = await api.get<ApiResponse<LeadStats>>('/leads/stats');
    return data;
  },

  exportCSV: async (filters: Partial<LeadFilters>): Promise<void> => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.source) params.set('source', filters.source);
    if (filters.search) params.set('search', filters.search);

    const response = await api.get(`/leads/export?${params.toString()}`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data as BlobPart]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leads-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
