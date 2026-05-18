import api from './api';
import { ApiResponse, User } from '../types';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
  role?: 'admin' | 'sales';
}

export interface AuthData {
  user: User;
  token: string;
}

export const authService = {
  login: async (payload: LoginPayload): Promise<ApiResponse<AuthData>> => {
    const { data } = await api.post<ApiResponse<AuthData>>('/auth/login', payload);
    return data;
  },

  register: async (payload: RegisterPayload): Promise<ApiResponse<AuthData>> => {
    const { data } = await api.post<ApiResponse<AuthData>>('/auth/register', payload);
    return data;
  },

  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const { data } = await api.get<ApiResponse<{ user: User }>>('/auth/me');
    return data;
  },

  getAllUsers: async (): Promise<ApiResponse<{ users: User[]; total: number }>> => {
    const { data } = await api.get<ApiResponse<{ users: User[]; total: number }>>('/auth/users');
    return data;
  },
};
