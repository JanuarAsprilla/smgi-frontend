import api from './api';

export const authService = {
  login: async (username: string, password: string) => {
    const { data } = await api.post('/auth/login/', { username, password });
    
    // Guardar tokens
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    
    // Obtener datos del usuario
    const userResponse = await api.get('/users/users/me/', {
      headers: { Authorization: `Bearer ${data.access}` }
    });
    
    return {
      user: userResponse.data,
      access: data.access,
      refresh: data.refresh,
    };
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const { data } = await api.get('/users/users/me/');
    return data;
  },

  refreshToken: async () => {
    const refresh = localStorage.getItem('refresh_token');
    if (!refresh) throw new Error('No refresh token');
    
    const { data } = await api.post('/auth/refresh/', { refresh });
    localStorage.setItem('access_token', data.access);
    return data.access;
  },
};
