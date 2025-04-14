
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { toast } from 'sonner';
import { authService } from '@/services/api';
import { AuthContextProps } from './types';

// Create authentication context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// User provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load user on initialization
  useEffect(() => {
    const loadUser = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = await authService.getCurrentUser();
          
          if (userData) {
            setUser(userData);
            setProfile(userData); // Using the same user data for profile
          }
        }
      } catch (error) {
        console.error("Error loading user:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Attempting login with:', { email });
      
      const data = await authService.login(email, password);
      
      setUser(data.user);
      setProfile(data.user); // Using the same user data for profile
      
      console.log('Login successful:', data.user.email);
      toast.success('Login successful');
      return data;
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Failed to sign in';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, fullName: string, role: string, department: string) => {
    try {
      setLoading(true);
      console.log('Signing up user:', { email, fullName, role });
      
      const data = await authService.register(email, password, fullName, role, department);
      
      toast.success('Registration successful! You can now sign in.');
      return data;
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let message = 'Failed to register';
      if (error.response?.data?.error) {
        message = error.response.data.error;
      } else if (error.message) {
        message = error.message;
      }
      
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setLoading(true);
      await authService.logout();
      
      setUser(null);
      setProfile(null);
      
      toast.success('Logged out successfully');
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
      session: null, // We don't use Supabase session anymore
      loading,
      signIn,
      signOut,
      signUp,
      signInWithOAuth: async () => {
        toast.error('OAuth sign in is not supported with this configuration');
      }
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
