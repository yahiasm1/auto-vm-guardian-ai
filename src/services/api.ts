
import axios from 'axios';

// Set the API URL based on environment
const API_URL = import.meta.env.VITE_API_URL || '/api';

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

// Intercept responses to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response) {
      console.log('API Error Response:', error.response.status, error.response.data);
    } else if (error.request) {
      console.log('API Request Error:', error.request);
    } else {
      console.log('API Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
