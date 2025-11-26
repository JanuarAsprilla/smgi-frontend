import api from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/users/login/', { username, password });
    return data;
  },
  
  getProfile: async (): Promise<User> => {
    const { data } = await api.get<User>('/users/profile/');
    return data;
  },
};
