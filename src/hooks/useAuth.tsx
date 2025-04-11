import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name: string, role: string, department: string) => Promise<void>;
  supabaseConfigured: boolean;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [supabaseConfigured, setSupabaseConfigured] = useState<boolean>(isSupabaseConfigured());
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
    }).catch(error => {
      console.error('Error getting session:', error);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabaseConfigured]);

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

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      signIn, 
      signOut, 
      signUp,
      supabaseConfigured 
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
