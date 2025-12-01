import api from './api';
import { API_ENDPOINTS } from '../config/api';
import type { AuthResponse, User } from '../types';

export const authService = {
  /**
   * Login with username and password
   */
  login: async (username: string, password: string): Promise<AuthResponse & { user: User }> => {
    const { data } = await api.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, { 
      username, 
      password 
    });
    
    // Save tokens
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    
    // Get current user data
    const userResponse = await api.get<User>(API_ENDPOINTS.USERS.ME);
    
    return {
      access: data.access,
      refresh: data.refresh,
      user: userResponse.data,
    };
  },

  /**
   * Logout and clear tokens
   */
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  /**
   * Get current authenticated user
   */
  getCurrentUser: async (): Promise<User> => {
    const { data } = await api.get<User>(API_ENDPOINTS.USERS.ME);
    return data;
  },

  /**
   * Refresh access token using refresh token
   */
  refreshToken: async (): Promise<string> => {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) {
      throw new Error('No refresh token available');
    }
    
    const { data } = await api.post<{ access: string }>(API_ENDPOINTS.AUTH.REFRESH, { 
      refresh 
    });
    
    localStorage.setItem('access_token', data.access);
    return data.access;
  },

  /**
   * Verify if a token is valid
   */
  verifyToken: async (token: string): Promise<boolean> => {
    try {
      await api.post(API_ENDPOINTS.AUTH.VERIFY, { token });
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('access_token');
    return !!token;
  },
};
