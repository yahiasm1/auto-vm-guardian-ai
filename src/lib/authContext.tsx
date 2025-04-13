import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/services/api';
import { toast } from 'sonner';

// Define user types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'instructor' | 'student';
  department: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  last_active: string;
  created_at: string;
}

// Define authentication context type
interface AuthContextProps {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name: string, role: string, department: string) => Promise<void>;
  signInWithOAuth: (provider: string) => Promise<void>;
}

// Create authentication context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// User provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load user on initialization
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (token) {
          const response = await authApi.getMe();
          setUser(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        localStorage.removeItem('accessToken');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Attempting login with:', { email });
      
      const response = await authApi.login(email, password);
      console.log('Login response:', response.data);
      
      const { user, accessToken } = response.data;
      
      setUser(user);
      localStorage.setItem('accessToken', accessToken);
      
      return;
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Failed to sign in';
      
      // Handle different types of errors
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        errorMessage = error.response.data?.error || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        errorMessage = error.message || 'An unexpected error occurred';
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
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('accessToken');
      setLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, name: string, role: string, department: string) => {
    try {
      setLoading(true);
      await authApi.register({ email, password, name, role, department });
      toast.success('Registration successful! Please log in.');
    } catch (error: any) {
      console.error('Registration error:', error);
      const message = error.response?.data?.error || 'Failed to register';
      toast.error(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // OAuth sign in (mock implementation)
  const signInWithOAuth = async (provider: string) => {
    try {
      setLoading(true);
      // This would typically redirect to OAuth provider
      // For now, we'll just show a message
      toast.error(`OAuth with ${provider} not implemented yet`);
    } catch (error) {
      console.error('OAuth error:', error);
      toast.error('OAuth sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
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
