
import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import LoginForm from '@/components/auth/LoginForm';
import TestAccountsSection from '@/components/auth/TestAccountsSection';
import { useForm } from 'react-hook-form';

const Login = () => {
  const [accountCreated, setAccountCreated] = useState<string | null>(null);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const form = useForm();

  useEffect(() => {
    if (user && profile) {
      console.log("User authenticated, redirecting:", { user: user.email, role: profile.role });
      const from = (location.state as any)?.from?.pathname || 
        (profile.role === 'admin' ? '/admin' : '/student');
      navigate(from, { replace: true });
    }
  }, [user, profile, navigate, location]);

  const setCredentials = (email: string, password: string) => {
    form.setValue('email', email);
    form.setValue('password', password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {accountCreated && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-md mb-4">
              Account created with email: {accountCreated}. You can now sign in.
            </div>
          )}

          <LoginForm />
          
          <TestAccountsSection onSetCredentials={setCredentials} />
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <div className="text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/register" className="text-vmSystem-blue hover:underline">
              Create an account
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
