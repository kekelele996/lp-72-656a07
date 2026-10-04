import { create } from 'zustand';
import { User } from '../types';
import { authApi } from '../lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  
  login: (username: string, password: string) => Promise<boolean>;
  register: (data: { username: string; email: string; password: string; displayName?: string }) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  setError: (error: string | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.login(username, password);
      const { access_token, user } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, token: access_token, isLoading: false });
      return true;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || '登录失败',
        isLoading: false,
      });
      return false;
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authApi.register(data);
      const { access_token, user } = response.data;
      
      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));
      
      set({ user, token: access_token, isLoading: false });
      return true;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || '注册失败',
        isLoading: false,
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ user: null, token: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (!token) {
      set({ user: null, token: null });
      return false;
    }

    try {
      if (savedUser) {
        set({ user: JSON.parse(savedUser), token });
      }
      
      const response = await authApi.getProfile();
      set({ user: response.data, token });
      localStorage.setItem('user', JSON.stringify(response.data));
      return true;
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      set({ user: null, token: null });
      return false;
    }
  },

  setError: (error) => set({ error }),
}));
