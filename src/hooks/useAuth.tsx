
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

    // Set up auth state listener FIRST to avoid missing auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      // Only synchronous state updates here to prevent infinite loops
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      // Use setTimeout to defer fetching notifications to avoid auth deadlocks
      if (newSession?.user) {
        setTimeout(() => {
          fetchUserNotifications(newSession.user.id);
        }, 0);
      } else {
        setNotifications([]);
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      setUser(existingSession?.user ?? null);
      setLoading(false);
      
      // If user is logged in, fetch their notifications
      if (existingSession?.user) {
        fetchUserNotifications(existingSession.user.id);
      }
    }).catch(error => {
      console.error('Error getting session:', error);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
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
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        throw error;
      }
      
      // Get user role and redirect accordingly
      if (data.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('email', email)
          .maybeSingle();
          
        if (userError) {
          console.error('Error fetching user role:', userError);
        }
        
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
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      // Clear local state
      setUser(null);
      setSession(null);
      setNotifications([]);
      
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
      // Create auth user without redirecting
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
      
      // Add user to users table
      if (data.user) {
        // Use RPC to insert the user bypassing RLS policies that might cause recursion
        const { error: insertError } = await supabase.from('users').insert({
          id: data.user.id,
          email,
          name,
          role: role as 'admin' | 'instructor' | 'student' | 'guest',
          department,
          status: 'pending',
          last_active: new Date().toISOString(),
          created_at: new Date().toISOString()
        });
        
        if (insertError) {
          console.error('Error inserting user data:', insertError);
          throw insertError;
        }
      }
      
      toast('Sign up successful', {
        description: 'Please check your email for verification'
      });
      navigate('/login');
    } catch (error: any) {
      toast('Sign up failed', {
        description: error.message || 'Something went wrong during signup',
        style: { backgroundColor: 'rgb(239 68 68)' }
      });
    }
  };
  
  const signInWithOAuth = async (provider: Provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
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
