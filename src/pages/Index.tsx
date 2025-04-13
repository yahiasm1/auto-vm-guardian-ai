
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/authContext';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is authenticated, redirect to their dashboard
    if (user && !loading) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'student') {
        navigate('/student');
      } else if (user.role === 'instructor') {
        navigate('/instructor'); // This route doesn't exist yet, but we can add it later
      }
    }
  }, [user, loading, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="mb-6 text-4xl font-bold tracking-tight text-slate-900 dark:text-white md:text-6xl">
          VM Guardian
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
          The complete solution for virtual machine management in educational environments.
        </p>
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-x-4 sm:space-y-0">
          <Button
            onClick={() => navigate('/login')}
            className="text-base"
            size="lg"
          >
            Sign In
          </Button>
          <Button
            onClick={() => navigate('/register')}
            variant="outline"
            className="text-base"
            size="lg"
          >
            Register
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
