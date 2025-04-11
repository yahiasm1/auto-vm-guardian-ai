import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Session, User, Provider } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name: string, role: string, department: string) => Promise<void>;
  signInWithOAuth: (provider: Provider) => Promise<void>;
  supabaseConfigured: boolean;
  notifications: Notification[];
  markNotificationAsRead: (id: string) => Promise<void>;
}

interface Notification {
  id: string;
  user_id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  created_at: string;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [supabaseConfigured, setSupabaseConfigured] = useState<boolean>(isSupabaseConfigured());
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if Supabase is configured before trying to use it
    if (!supabaseConfigured) {
      setLoading(false);
      toast('Supabase configuration missing', {
        description: 'Please check your environment variables',
        style: { backgroundColor: 'rgb(239 68 68)' }
      });
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // If user is logged in, fetch their notifications
      if (session?.user) {
        fetchUserNotifications(session.user.id);
      }
    }).catch(error => {
      console.error('Error getting session:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // If user is logged in, fetch their notifications
      if (session?.user) {
        fetchUserNotifications(session.user.id);
      } else {
        setNotifications([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabaseConfigured]);
  
  const fetchUserNotifications = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (error) {
        throw error;
      }
      
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };
  
  const markNotificationAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Update the local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      
    } catch (error: any) {
      toast('Failed to mark notification as read', {
        description: error.message,
        style: { backgroundColor: 'rgb(239 68 68)' }
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
      
      toast('Sign in successful', {
        description: 'You have been signed in successfully'
      });
      
      // Get user role and redirect accordingly
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('email', email)
        .single();
        
      if (userError) {
        throw userError;
      }
      
      if (userData?.role === 'admin') {
        navigate('/admin');
      } else if (userData?.role === 'student') {
        navigate('/student');
      } else {
        navigate('/');
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
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      navigate('/');
      toast('Sign out successful');
    } catch (error: any) {
      toast('Sign out failed', {
        description: error.message,
        style: { backgroundColor: 'rgb(239 68 68)' }
      });
    }
  };
  
  const signUp = async (email: string, password: string, name: string, role: string, department: string) => {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name,
            role,
            department
          }
        }
      });
      
      if (authError) {
        throw authError;
      }
      
      // Add user to users table
      if (authData.user) {
        const { error: insertError } = await supabase.from('users').insert({
          id: authData.user.id,
          email,
          name,
          role: role as 'admin' | 'instructor' | 'student' | 'guest',
          department,
          status: 'pending',
          last_active: new Date().toISOString(),
          created_at: new Date().toISOString()
        });
        
        if (insertError) {
          throw insertError;
        }
      }
      
      toast('Sign up successful', {
        description: 'Please check your email for verification'
      });
      navigate('/');
    } catch (error: any) {
      toast('Sign up failed', {
        description: error.message,
        style: { backgroundColor: 'rgb(239 68 68)' }
      });
    }
  };
  
  const signInWithOAuth = async (provider: Provider) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin + '/auth/callback'
        }
      });
      
      if (error) {
        throw error;
      }
      
      // The user will be redirected to the OAuth provider
      // No need for navigation logic here as the auth state listener will handle it
    } catch (error: any) {
      toast('OAuth sign in failed', {
        description: error.message,
        style: { backgroundColor: 'rgb(239 68 68)' }
      });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      signIn, 
      signOut, 
      signUp,
      signInWithOAuth,
      supabaseConfigured,
      notifications,
      markNotificationAsRead
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
