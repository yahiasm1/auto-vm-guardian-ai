
import api from './api';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  department?: string;
  status?: string;
  last_active?: string;
  created_at?: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  name: string;
  role: string;
  department?: string;
}

export interface UpdateUserProfilePayload {
  name?: string;
  department?: string;
}

const userService = {
  /**
   * Get all users
   */
  async getUsers(): Promise<User[]> {
    const response = await api.get('/users');
    return response.data.users || [];
  },
  
  /**
   * Create a new user (admin only)
   */
  async createUser(payload: CreateUserPayload): Promise<User> {
    const response = await api.post('/auth/register', payload);
    return response.data.user;
  },

  /**
   * Update current user's profile
   */
  async updateProfile(payload: UpdateUserProfilePayload): Promise<User> {
    const response = await api.put('/users/profile', payload);
    return response.data.user;
  }
};

export default userService;
