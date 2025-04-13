
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AuthContextProps, Profile } from './types';
import { fetchUserProfile } from './useSupabaseAuth';

// Create authentication context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// User provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

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
            try {
              const userProfile = await fetchUserProfile(currentSession.user.id);
              console.log('Fetched user profile:', userProfile);
              setProfile(userProfile);
            } catch (error) {
              console.error('Error fetching user profile:', error);
            }
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
        try {
          const userProfile = await fetchUserProfile(currentSession.user.id);
          console.log('Fetched user profile from existing session:', userProfile);
          setProfile(userProfile);
        } catch (error) {
          console.error('Error fetching user profile from existing session:', error);
        }
      }

      setLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Sign in function using Supabase auth
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Attempting login with:', { email });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error details:', error);
        throw error;
      } else {
        console.log('Login successful:', data.user?.email);
        toast.success('Login successful');
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

  // Sign up function using Supabase auth
  const signUp = async (email: string, password: string, fullName: string, role: string, department: string) => {
    try {
      setLoading(true);
      console.log('Signing up user:', { email, fullName, role });
      
      // First check if the user already exists by trying to sign in
      const { data: existingData, error: existingError } = await supabase.auth.signInWithPassword({
        email, 
        password
      }).catch(() => ({ data: null, error: { message: 'Not found' } }));
      
      if (existingData?.user) {
        // If login successful, the user already exists
        console.log('User already exists:', email);
        
        // Sign out again to allow proper login flow
        await supabase.auth.signOut();
        
        // Return the user data to indicate success
        return { user: existingData.user, session: null };
      }
      
      // If we get here, user doesn't exist or wrong password, proceed with signup
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName,
            role: role || 'student',
            department: department || '',
          }
        }
      });

      if (error) {
        console.error('Registration error details:', error);
        throw error;
      }

      console.log('Registration data returned:', data);

      // Create profile record for the new user
      if (data.user && data.user.id) {
        console.log('Creating profile for:', data.user.id);
        try {
          const { data: profileData, error: profileError } = await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: fullName,
            role: role as any,
            department: department || null,
            email: email,
            last_active: new Date().toISOString(),
            status: 'active'
          }).select('*');

          if (profileError) {
            console.error('Error creating profile:', profileError);
          } else {
            console.log('Profile created successfully:', profileData);
          }
        } catch (profileError) {
          console.error('Exception creating profile:', profileError);
        }
      }

      toast.success('Registration successful! Please check your email to confirm your account.');
      return data;
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Check for specific error indicating the user already exists
      if (error.message && (
          error.message.includes("already registered") || 
          error.message.includes("duplicate key") ||
          error.message.includes("Database error saving"))) {
        throw new Error("Email already registered. Please sign in instead.");
      }
      
      const message = error.message || 'Failed to register';
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Sign out function using Supabase auth
  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
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

  // OAuth sign-in function
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

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      loading,
      signIn,
      signOut,
      signUp,
      signInWithOAuth
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
