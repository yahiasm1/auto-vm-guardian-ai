
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export const userService = {
  getAllUsers: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  
  getUserById: async (id: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  createUser: async (user: UserInsert) => {
    const { data, error } = await supabase
      .from('users')
      .insert(user)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  updateUser: async (id: string, updates: UserUpdate) => {
    // Update last_active timestamp
    const updatesWithTimestamp = {
      ...updates,
      last_active: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('users')
      .update(updatesWithTimestamp)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  deleteUser: async (id: string) => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },
  
  getUsersByDepartment: async (department: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('department', department)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  
  getUsersByRole: async (role: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  
  updateUserStatus: async (id: string, status: 'active' | 'inactive' | 'suspended' | 'pending') => {
    const { data, error } = await supabase
      .from('users')
      .update({ status, last_active: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
};
