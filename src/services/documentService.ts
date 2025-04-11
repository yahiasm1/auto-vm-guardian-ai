
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/supabase';

export type Document = Database['public']['Tables']['documents']['Row'];
export type DocumentInsert = Database['public']['Tables']['documents']['Insert'];
export type DocumentUpdate = Database['public']['Tables']['documents']['Update'];

export const documentService = {
  getAllDocuments: async () => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  
  getDocumentById: async (id: string) => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },
  
  getDocumentsByCategory: async (category: string) => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },
  
  createDocument: async (document: DocumentInsert) => {
    // Ensure timestamps
    const now = new Date().toISOString();
    const docWithTimestamps = {
      ...document,
      created_at: now,
      updated_at: now
    };
    
    const { data, error } = await supabase
      .from('documents')
      .insert(docWithTimestamps)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  updateDocument: async (id: string, updates: DocumentUpdate) => {
    // Always update the updated_at timestamp
    const updatesWithTimestamp = {
      ...updates,
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('documents')
      .update(updatesWithTimestamp)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },
  
  deleteDocument: async (id: string) => {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  },
  
  searchDocuments: async (query: string) => {
    // Search in title and content
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
};
