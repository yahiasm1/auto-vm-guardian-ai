
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

export type Assignment = Database['public']['Tables']['assignments']['Row'];
export type AssignmentInsert = Database['public']['Tables']['assignments']['Insert'];
export type AssignmentUpdate = Database['public']['Tables']['assignments']['Update'];

export const assignmentService = {
  getAllAssignments: async () => {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .order('due_date', { ascending: true });
    
    if (error) throw error;
    return data;
  },
  
  getAssignmentById: async (id: string) => {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  getAssignmentsByCourse: async (course: string) => {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .eq('course', course)
      .order('due_date', { ascending: true });
    
    if (error) throw error;
    return data;
  },
  
  createAssignment: async (assignment: AssignmentInsert) => {
    // Ensure created_at timestamp
    const assignmentWithTimestamp = {
      ...assignment,
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('assignments')
      .insert(assignmentWithTimestamp)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  updateAssignment: async (id: string, updates: AssignmentUpdate) => {
    const { data, error } = await supabase
      .from('assignments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  deleteAssignment: async (id: string) => {
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },
  
  getUpcomingAssignments: async (limit: number = 5) => {
    const today = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .gte('due_date', today)
      .order('due_date', { ascending: true })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }
};
