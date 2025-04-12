
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Provider } from '@supabase/supabase-js';
import { toast } from 'sonner';

export const authService = {
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    return true;
  },
  
  signUp: async (email: string, password: string, name: string, role: string, department: string) => {
    console.log(`Signing up with role: ${role}, department: ${department}`);
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          name,
          role,
          department
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) {
      throw error;
    }
    
    return data;
  },
  
  signInWithOAuth: async (provider: Provider) => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
    
    if (error) {
      throw error;
    }
  },
  
  getSession: async () => {
    return await supabase.auth.getSession();
  },

  checkSupabaseConfig: () => {
    return isSupabaseConfigured();
  },

  getUserRole: async (email: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('email', email)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching user role:', error);
    }
    
    return data;
  },

  onAuthStateChange: (callback: (session: any) => void) => {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  }
};
