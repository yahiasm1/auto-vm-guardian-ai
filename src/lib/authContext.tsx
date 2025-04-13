
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { authApi } from '@/services/api';
import { toast } from 'sonner';

// Define user types
export interface Profile {
  id: string;
  full_name: string;
  role: 'admin' | 'instructor' | 'student';
  department: string | null;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  email: string | null; // Added email field
  last_active: string;
  created_at: string;
}

// Define authentication context type
interface AuthContextProps {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: string, department: string) => Promise<void>;
  signInWithOAuth: (provider: string) => Promise<void>;
}

// Create authentication context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// User provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch user profile
  const fetchUserProfile = async (userId: string) => {
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
        try {
          const response = await authApi.login(email, password);
          
          // Store the token from the API
          if (response.data.accessToken) {
            localStorage.setItem('accessToken', response.data.accessToken);
            
            // Try to get user profile from API
            try {
              const userResponse = await authApi.getMe();
              setUser(userResponse.data as unknown as User);
              setProfile(userResponse.data as unknown as Profile);
              toast.success('Login successful via API');
              return;
            } catch (profileError) {
              console.error('Error fetching user profile from API:', profileError);
              throw new Error('Failed to fetch user profile');
            }
          }
        } catch (apiError: any) {
          console.error('API login error:', apiError);
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
      try {
        await authApi.logout();
      } catch (apiError) {
        console.error('API logout error:', apiError);
      }
      
      // Clear local storage
      localStorage.removeItem('accessToken');
      
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
