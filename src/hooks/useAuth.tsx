
import { useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthContext } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { useNotifications } from '@/hooks/useNotifications';
import { AuthState } from '@/types/auth';

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    supabaseConfigured: authService.checkSupabaseConfig(),
    notifications: []
  });
  
  const navigate = useNavigate();
  const { 
    notifications, 
    fetchUserNotifications, 
    markNotificationAsRead, 
    clearNotifications 
  } = useNotifications(authState.user?.id);

  useEffect(() => {
    if (!authState.supabaseConfigured) {
      setAuthState(prev => ({ ...prev, loading: false }));
      toast('Supabase configuration missing', {
        description: 'Please check your environment variables',
        style: { backgroundColor: 'rgb(239 68 68)' }
      });
      return;
    }

    const { data: { subscription } } = authService.onAuthStateChange((newSession) => {
      setAuthState(prev => ({
        ...prev,
        session: newSession,
        user: newSession?.user ?? null,
      }));
      
      if (newSession?.user) {
        setTimeout(() => {
          fetchUserNotifications(newSession.user.id);
        }, 0);
      } else {
        clearNotifications();
      }
    });

    authService.getSession().then(({ data: { session: existingSession } }) => {
      setAuthState(prev => ({
        ...prev,
        session: existingSession,
        user: existingSession?.user ?? null,
        loading: false
      }));
      
      if (existingSession?.user) {
        fetchUserNotifications(existingSession.user.id);
      }
    }).catch(error => {
      console.error('Error getting session:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [authState.supabaseConfigured]);

  // Update notifications in auth state when they change
  useEffect(() => {
    setAuthState(prev => ({ ...prev, notifications }));
  }, [notifications]);

  const signIn = async (email: string, password: string) => {
    try {
      const data = await authService.signIn(email, password);
      
      if (data.user) {
        const userData = await authService.getUserRole(email);
        
        toast('Sign in successful', {
          description: 'You have been signed in successfully'
        });
        
        if (userData?.role === 'admin') {
          navigate('/admin');
        } else if (userData?.role === 'student') {
          navigate('/student');
        } else {
          navigate('/');
        }
      }
    } catch (error: any) {
      toast('Sign in failed', {
        description: error.message,
        style: { backgroundColor: 'rgb(239 68 68)' }
      });
    }
  };
  
  const signOut = async () => {
    try {
      await authService.signOut();
      
      setAuthState(prev => ({ 
        ...prev, 
        user: null,
        session: null
      }));
      clearNotifications();
      
      toast('Sign out successful');
      navigate('/login');
    } catch (error: any) {
      toast('Sign out failed', {
        description: error.message,
        style: { backgroundColor: 'rgb(239 68 68)' }
      });
    }
  };
  
  const signUp = async (email: string, password: string, name: string, role: string, department: string) => {
    try {
      const data = await authService.signUp(email, password, name, role, department);
      
      if (data.user) {
        console.log('Auth signup successful, user:', data.user.id);
        toast('Sign up successful', {
          description: 'Please check your email for verification'
        });
        navigate('/login');
      }
    } catch (error: any) {
      toast('Sign up failed', {
        description: error.message || 'Something went wrong during signup',
        style: { backgroundColor: 'rgb(239 68 68)' }
      });
    }
  };
  
  const signInWithOAuth = async (provider: any) => {
    try {
      await authService.signInWithOAuth(provider);
    } catch (error: any) {
      toast('OAuth sign in failed', {
        description: error.message,
        style: { backgroundColor: 'rgb(239 68 68)' }
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      ...authState,
      signIn, 
      signOut, 
      signUp,
      signInWithOAuth,
      markNotificationAsRead
    }}>
      {children}
    </AuthContext.Provider>
  );
};
