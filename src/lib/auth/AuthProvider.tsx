
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AuthContextProps, Profile } from './types';
import { useSupabaseAuth, fetchUserProfile } from './useSupabaseAuth';
import { useApiAuth } from './useApiAuth';

// Create authentication context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// User provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Get auth methods from custom hooks
  const supabaseAuth = useSupabaseAuth();
  const apiAuth = useApiAuth();

  // Load user on initialization
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          // Use setTimeout to prevent Supabase deadlock
          setTimeout(async () => {
            const userProfile = await fetchUserProfile(currentSession.user.id);
            setProfile(userProfile);
          }, 0);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      console.log('Existing session:', currentSession?.user?.email);
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        const userProfile = await fetchUserProfile(currentSession.user.id);
        setProfile(userProfile);
      }

      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Sign in function - try both Supabase and API auth
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Attempting login with:', { email });
      
      // First try Supabase authentication
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // If Supabase auth fails, try the API
        const apiResult = await apiAuth.apiLogin(email, password);
        if (apiResult) {
          setUser(apiResult.user);
          setProfile(apiResult.profile);
          toast.success('Login successful via API');
          return;
        } else {
          throw error; // Throw the original Supabase error if API fails too
        }
      } else {
        console.log('Login successful:', data.user?.email);
        toast.success('Login successful via Supabase');
        return;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Failed to sign in';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      
      // First try Supabase signout
      const { error } = await supabase.auth.signOut();
      
      // Also sign out from the API
      await apiAuth.apiLogout();
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      signIn,
      signOut,
      signUp: supabaseAuth.signUp,
      signInWithOAuth: supabaseAuth.signInWithOAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Import React's useContext at the top level to avoid issues
import { useContext } from 'react';
