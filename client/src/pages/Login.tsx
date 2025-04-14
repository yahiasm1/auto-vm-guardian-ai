
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import LoginForm from '@/components/auth/LoginForm';
import TestAccountsSection from '@/components/auth/TestAccountsSection';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');

  const handleSetCredentials = (email: string, password: string) => {
    setEmailValue(email);
    setPasswordValue(password);
  };

  const handleLoginSuccess = () => {
    navigate('/admin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>
            Log in to access the VM Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm onSuccess={handleLoginSuccess} />
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <a
                href="/register"
                className="text-primary font-semibold hover:underline"
              >
                Register
              </a>
            </p>
          </div>
          
          <TestAccountsSection onSetCredentials={handleSetCredentials} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
