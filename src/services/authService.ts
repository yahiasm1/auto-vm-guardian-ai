
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Provider } from '@supabase/supabase-js';
import { toast } from 'sonner';

export const authService = {
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      console.error("Authentication error:", error);
      throw error;
    }
    
    return data;
  },
  
  signOut: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      return true;
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
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
      console.error("Signup error:", error);
      throw error;
    }
    
    // Log the results for debugging
    console.log("Signup response:", data);
    console.log("User metadata:", data.user?.user_metadata);
    
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
      console.error("OAuth sign in error:", error);
      throw error;
    }
  },
  
  getSession: async () => {
    try {
      return await supabase.auth.getSession();
    } catch (error) {
      console.error("Get session error:", error);
      throw error;
    }
  },

  checkSupabaseConfig: () => {
    return isSupabaseConfigured();
  },

  getUserRole: async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('email', email)
        .maybeSingle();
        
      if (error) {
        console.error('Error fetching user role:', error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error in getUserRole:', error);
      throw error;
    }
  },

  onAuthStateChange: (callback: (session: any) => void) => {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  },
  
  // New function to create users for the dummy data
  createDummyAuthUsers: async () => {
    // NOTE: This function will need to be called from an edge function
    // as it requires the service role key
    try {
      const { data: result } = await supabase.functions.invoke('create-dummy-users', {
        method: 'POST'
      });
      
      return result;
    } catch (error: any) {
      console.error('Error creating dummy auth users:', error);
      throw error;
    }
  }
};
