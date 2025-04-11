
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the session from the URL
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        const session = data?.session;
        // If no session was found, redirect to login
        if (!session) {
          throw new Error('No session found');
        }
        
        // Get user role and redirect accordingly
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .maybeSingle();
          
        if (userError) {
          console.error('Error fetching user data:', userError);
          
          // If user doesn't exist in the users table yet, we need to create them
          // This can happen with OAuth sign-ins
          if (session.user) {
            // Get metadata from the user's profile
            const metadata = session.user.user_metadata || {};
            
            const { error: insertError } = await supabase.from('users').insert({
              id: session.user.id,
              email: session.user.email || '',
              name: metadata.full_name || metadata.name || session.user.email?.split('@')[0] || 'User',
              role: 'student', // Default role
              department: 'External',
              status: 'pending',
              last_active: new Date().toISOString(),
              created_at: new Date().toISOString()
            });
            
            if (insertError) {
              console.error('Error creating user record:', insertError);
            }
          }
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
      } catch (error: any) {
        toast('Authentication error', {
          description: error.message || 'Something went wrong during authentication',
          style: { backgroundColor: 'rgb(239 68 68)' }
        });
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="text-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
        <h2 className="mt-4 text-xl font-semibold">Processing login...</h2>
        <p className="text-muted-foreground">Please wait while we authenticate you.</p>
      </div>
    </div>
  );
};

export default AuthCallback;
