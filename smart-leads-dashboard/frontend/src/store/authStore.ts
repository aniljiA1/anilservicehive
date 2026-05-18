import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { authService, LoginPayload, RegisterPayload } from '../services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authService.login(payload);
          if (res.success && res.data) {
            const { user, token } = res.data;
            localStorage.setItem('token', token);
            set({ user, token, isAuthenticated: true, isLoading: false });
          } else {
            set({ error: res.message, isLoading: false });
          }
        } catch (err: unknown) {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response?.data
              ?.message || 'Login failed';
          set({ error: msg, isLoading: false });
          throw err;
        }
      },

      register: async (payload) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authService.register(payload);
          if (res.success && res.data) {
            const { user, token } = res.data;
            localStorage.setItem('token', token);
            set({ user, token, isAuthenticated: true, isLoading: false });
          } else {
            set({ error: res.message, isLoading: false });
          }
        } catch (err: unknown) {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response?.data
              ?.message || 'Registration failed';
          set({ error: msg, isLoading: false });
          throw err;
        }
      },

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },

      clearError: () => set({ error: null }),

      fetchProfile: async () => {
        try {
          const res = await authService.getProfile();
          if (res.success && res.data) {
            set({ user: res.data.user, isAuthenticated: true });
          }
        } catch {
          set({ user: null, token: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
