
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

export type VirtualMachine = Database['public']['Tables']['virtual_machines']['Row'];
export type VMInsert = Database['public']['Tables']['virtual_machines']['Insert'];
export type VMUpdate = Database['public']['Tables']['virtual_machines']['Update'];

export const vmService = {
  getAllVMs: async () => {
    const { data, error } = await supabase
      .from('virtual_machines')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  
  getVMById: async (id: string) => {
    const { data, error } = await supabase
      .from('virtual_machines')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  getVMsByUserId: async (userId: string) => {
    const { data, error } = await supabase
      .from('virtual_machines')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  
  createVM: async (vm: VMInsert) => {
    // Ensure defaults
    const vmWithDefaults = {
      ...vm,
      status: vm.status || 'creating',
      created_at: new Date().toISOString(),
      last_updated: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('virtual_machines')
      .insert(vmWithDefaults)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  updateVM: async (id: string, updates: VMUpdate) => {
    // Always update last_updated timestamp
    const updatesWithTimestamp = {
      ...updates,
      last_updated: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('virtual_machines')
      .update(updatesWithTimestamp)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  deleteVM: async (id: string) => {
    const { error } = await supabase
      .from('virtual_machines')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },
  
  updateVMStatus: async (id: string, status: 'running' | 'stopped' | 'suspended' | 'creating' | 'error') => {
    const { data, error } = await supabase
      .from('virtual_machines')
      .update({ 
        status, 
        last_updated: new Date().toISOString() 
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  getVMsByCourse: async (course: string) => {
    const { data, error } = await supabase
      .from('virtual_machines')
      .select('*')
      .eq('course', course)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};
