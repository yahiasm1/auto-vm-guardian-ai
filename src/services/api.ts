
import axios from 'axios';

// Use relative URL or environment variable for API
const API_URL = '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // For cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const refreshResponse = await axios.post(`${API_URL}/auth/refresh-token`, {}, {
          withCredentials: true // For cookies
        });
        
        if (refreshResponse.data.accessToken) {
          localStorage.setItem('accessToken', refreshResponse.data.accessToken);
          api.defaults.headers.common.Authorization = `Bearer ${refreshResponse.data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authApi = {
  register: (userData: any) => api.post('/auth/register', userData),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me')
};

export default api;
