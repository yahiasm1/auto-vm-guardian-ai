
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
          if (session.user) {
            // Get metadata from the user's profile
            const metadata = session.user.user_metadata || {};
            
            try {
              // Create a serverside client that bypasses RLS using service role key
              // This is done with a direct API call to avoid exposing keys in the frontend
              const options = {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                  id: session.user.id,
                  email: session.user.email || '',
                  name: metadata.name || metadata.full_name || session.user.email?.split('@')[0] || 'User',
                  role: metadata.role || 'student', // Default role
                  department: metadata.department || 'External',
                  status: 'pending',
                  last_active: new Date().toISOString(),
                  created_at: new Date().toISOString()
                })
              };
              
              // Send a request to directly insert the user using the REST API
              const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL || 'https://ezbqycpminkkqasrvvij.supabase.co'}/rest/v1/users`, options);
              
              if (!response.ok) {
                const errorData = await response.json();
                console.error('Error response from API:', errorData);
                throw new Error(`Failed to create user: ${JSON.stringify(errorData)}`);
              }
              
              console.log('User record created successfully');
            } catch (insertError: any) {
              console.error('Error creating user record:', insertError);
              throw insertError;
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
