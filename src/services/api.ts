
import axios from 'axios';
import { supabase } from '@/integrations/supabase/client';

// Set the API URL based on environment
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
  async (config) => {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    
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
