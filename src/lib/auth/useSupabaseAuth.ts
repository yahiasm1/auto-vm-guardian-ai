
import { useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Profile } from './types';

// Fetch user profile
export const fetchUserProfile = async (userId: string): Promise<Profile | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }

    return data as Profile;
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return null;
  }
};

// Hook for Supabase authentication methods
export const useSupabaseAuth = () => {
  const [loading, setLoading] = useState<boolean>(false);

  // Sign up function
  const signUp = async (email: string, password: string, fullName: string, role: string, department: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName,
            role: role || 'student',  // Default to student if no role specified
          }
        }
      });

      if (error) {
        throw error;
      }

      toast.success('Registration successful! Please check your email to confirm your account.');
    } catch (error: any) {
      console.error('Registration error:', error);
      const message = error.message || 'Failed to register';
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // OAuth sign in
  const signInWithOAuth = async (provider: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('OAuth error:', error);
      toast.error('OAuth sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    signUp,
    signInWithOAuth,
  };
};
