import api from './api';
import type { AuthResponse, User } from '../types';

// MODO DEMO ACTIVADO
const DEMO_MODE = true;

const demoUser: User = {
  id: 1,
  username: 'demo',
  email: 'demo@smgi.com',
};

export const authService = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    if (DEMO_MODE) {
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // En modo demo, cualquier credencial es válida
      return {
        access: 'demo-token-' + Date.now(),
        refresh: 'demo-refresh-token',
        user: {
          ...demoUser,
          username: username || 'demo'
        },
      };
    }
    
    const { data } = await api.post<AuthResponse>('/users/login/', { username, password });
    return data;
  },
  
  getProfile: async (): Promise<User> => {
    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return demoUser;
    }
    const { data } = await api.get<User>('/users/profile/');
    return data;
  },
};
