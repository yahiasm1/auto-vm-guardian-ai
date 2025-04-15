
import axios from 'axios';

// Set the API URL based on environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // For cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Auth service for handling authentication
export const authService = {
  // Login user
  async login(email: string, password: string) {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      // Store the token in local storage
      if (response.data.token) {
        localStorage.setItem('accessToken', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  // Register user
  async register(email: string, password: string, name: string, role: string, department?: string) {
    const response = await api.post('/auth/register', {
      email,
      password,
      name,
      role,
      department
    });
    
    return response.data;
  },
  
  // Refresh token
  async refreshToken() {
    try {
      const response = await api.post('/auth/refresh-token');
      
      if (response.data.token) {
        localStorage.setItem('accessToken', response.data.token);
      }
      
      return response.data;
    } catch (error) {
      this.logout();
      throw error;
    }
  },
  
  // Logout user
  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    }
  },
  
  // Get current user
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      return null;
    }
  },
  
  // Get stored token
  getToken() {
    return localStorage.getItem('accessToken');
  },
  
  // Check if user is logged in
  isAuthenticated() {
    return !!this.getToken();
  }
};

// Intercept requests to add auth token
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Handle 304 responses as successful responses
    if (error.response && error.response.status === 304) {
      console.log('Using cached data for request:', error.config.url);
      
      // Return a success response with empty data
      // The browser will use cached data automatically
      return Promise.resolve({ 
        data: error.response.data || {}, 
        status: 304, 
        statusText: 'Not Modified',
        headers: error.response.headers,
        config: error.config
      });
    }
    
    const originalRequest = error.config;
    
    // If error is 401 Unauthorized and not a refresh token request
    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        originalRequest.url !== '/auth/refresh-token') {
      
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshResponse = await authService.refreshToken();
        
        if (refreshResponse.token) {
          // Update the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${refreshResponse.token}`;
          return axios(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, redirect to login
        authService.logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
