import api from './api';
import type { AuthResponse, User } from '../types';

const DEMO_MODE = false;

export const authService = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return {
        access: 'demo-token-' + Date.now(),
        refresh: 'demo-refresh-token',
        user: {
          id: 1,
          username: username || 'demo',
          email: 'demo@smgi.com',
        },
      };
    }
    
    // ENDPOINT CORRECTO
    const { data } = await api.post<AuthResponse>('/users/auth/login/', { username, password });
    return data;
  },
  
  getProfile: async (): Promise<User> => {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { id: 1, username: 'demo', email: 'demo@smgi.com' };
    }
    const { data } = await api.get<User>('/users/profile/');
    return data;
  },
};
