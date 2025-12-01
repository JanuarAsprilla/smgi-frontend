import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL, API_ENDPOINTS } from '../config/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Flag to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request interceptor - Add auth token to all requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh and errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Check if it's a login or refresh request
      const isAuthRequest = 
        originalRequest.url?.includes(API_ENDPOINTS.AUTH.LOGIN) ||
        originalRequest.url?.includes(API_ENDPOINTS.AUTH.REFRESH);

      if (isAuthRequest) {
        // Clear tokens and redirect to login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      // Try to refresh token
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        // No refresh token available, redirect to login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
          { refresh: refreshToken }
        );

        const { access } = response.data;
        localStorage.setItem('access_token', access);

        // Update authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }

        // Process queued requests
        processQueue(null, access);

        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        processQueue(refreshError as AxiosError, null);
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      console.error('Access denied:', error.response.data);
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error('Resource not found:', error.config?.url);
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error('Server error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

export default api;
