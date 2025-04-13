
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/mockAuth';
import { toast } from 'sonner';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        if (!user) {
          // In frontend-only mode, we just redirect to login
          toast.error('Authentication failed', {
            description: 'Please try logging in again'
          });
          navigate('/login');
          return;
        }
        
        // User is authenticated, redirect based on role
        toast.success('Sign in successful');
        
        if (user.role === 'admin') {
          navigate('/admin');
        } else if (user.role === 'student') {
          navigate('/student');
        } else {
          navigate('/');
        }
      } catch (error: any) {
        toast.error('Authentication error', {
          description: error.message || 'Something went wrong during authentication'
        });
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate, user]);

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
