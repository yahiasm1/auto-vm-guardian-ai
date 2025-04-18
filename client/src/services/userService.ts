import api from "./api";

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

export interface UpdateUserPayload {
  id: string;
  name?: string;
  password?: string;
  department?: string;
  role?: string;
}

const userService = {
  /**
   * Get all users (admin only)
   */
  async getUsers(): Promise<User[]> {
    const response = await api.get("/users");
    return response.data.users || [];
  },

  /**
   * Create a new user (admin only)
   */
  async createUser(payload: CreateUserPayload): Promise<User> {
    const response = await api.post("/auth/register", payload);
    return response.data.user;
  },

  /**
   * Update current user's profile
   */
  async updateProfile(payload: UpdateUserProfilePayload): Promise<User> {
    const response = await api.put("/users/profile", payload);
    return response.data.user;
  },

  /**
   * Update user (admin only)
   */
  async updateUser(payload: UpdateUserPayload): Promise<User> {
    const response = await api.put(`/users/${payload.id}`, payload);
    return response.data.user;
  },

  /**
   * Delete user (admin only)
   */
  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};

export default userService;
