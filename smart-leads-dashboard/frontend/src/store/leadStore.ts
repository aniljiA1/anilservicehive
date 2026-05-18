import { create } from "zustand";
import {
  Lead,
  LeadFilters,
  LeadStats,
  Pagination,
  CreateLeadData,
  UpdateLeadData,
} from "../types";
import { leadService } from "../services/leadService";

interface LeadState {
  leads: Lead[];
  currentLead: Lead | null;
  stats: LeadStats | null;
  pagination: Pagination | null;
  filters: LeadFilters;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchLeads: () => Promise<void>;
  fetchLeadById: (id: string) => Promise<void>;
  fetchStats: () => Promise<void>;
  createLead: (data: CreateLeadData) => Promise<void>;
  updateLead: (id: string, data: UpdateLeadData) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  exportCSV: () => Promise<void>;
  setFilters: (filters: Partial<LeadFilters>) => void;
  resetFilters: () => void;
  clearError: () => void;
  clearCurrentLead: () => void;
}

const DEFAULT_FILTERS: LeadFilters = {
  status: "",
  source: "",
  search: "",
  sort: "latest",
  page: 1,
};

export const useLeadStore = create<LeadState>((set, get) => ({
  leads: [],
  currentLead: null,
  stats: null,
  pagination: null,
  filters: DEFAULT_FILTERS,
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchLeads: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await leadService.getLeads(get().filters);
      if (res.success && res.data) {
        set({
          leads: res.data.leads,
          pagination: res.pagination ?? null,
          isLoading: false,
        });
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to fetch leads";
      set({ error: msg, isLoading: false });
    }
  },

  fetchLeadById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await leadService.getLeadById(id);
      if (res.success && res.data) {
        set({ currentLead: res.data.lead, isLoading: false });
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to fetch lead";
      set({ error: msg, isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      const res = await leadService.getStats();
      if (res.success && res.data) {
        set({ stats: res.data });
      }
    } catch {
      // silently fail stats
    }
  },

  createLead: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await leadService.createLead(data);
      if (res.success && res.data) {
        set({ isSubmitting: false });
        await get().fetchLeads();
        await get().fetchStats();
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to create lead";
      set({ error: msg, isSubmitting: false });
      throw err;
    }
  },

  updateLead: async (id, data) => {
    set({ isSubmitting: true, error: null });
    try {
      const res = await leadService.updateLead(id, data);
      if (res.success && res.data) {
        set((state) => ({
          leads: state.leads.map((l) => (l._id === id ? res.data!.lead : l)),
          currentLead: res.data?.lead,
          isSubmitting: false,
        }));
        await get().fetchStats();
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to update lead";
      set({ error: msg, isSubmitting: false });
      throw err;
    }
  },

  deleteLead: async (id) => {
    set({ isSubmitting: true, error: null });
    try {
      await leadService.deleteLead(id);
      set((state) => ({
        leads: state.leads.filter((l) => l._id !== id),
        isSubmitting: false,
      }));
      await get().fetchStats();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to delete lead";
      set({ error: msg, isSubmitting: false });
      throw err;
    }
  },

  exportCSV: async () => {
    try {
      await leadService.exportCSV(get().filters);
    } catch {
      set({ error: "Failed to export CSV" });
    }
  },

  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters, page: filters.page ?? 1 },
    }));
  },

  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  clearError: () => set({ error: null }),

  clearCurrentLead: () => set({ currentLead: null }),
}));
