export type LeadStatus = 'New' | 'Contacted' | 'Qualified' | 'Lost';
export type LeadSource = 'Website' | 'Instagram' | 'Referral';
export type UserRole = 'admin' | 'sales';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface Lead {
  _id: string;
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  notes?: string;
  assignedTo?: User;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  errors?: { field: string; message: string }[];
  pagination?: Pagination;
}

export interface LeadFilters {
  status?: LeadStatus | '';
  source?: LeadSource | '';
  search: string;
  sort: 'latest' | 'oldest';
  page: number;
}

export interface LeadStats {
  total: number;
  statusStats: { _id: LeadStatus; count: number }[];
  sourceStats: { _id: LeadSource; count: number }[];
}

export interface CreateLeadData {
  name: string;
  email: string;
  status: LeadStatus;
  source: LeadSource;
  notes?: string;
}

export interface UpdateLeadData extends Partial<CreateLeadData> {}
