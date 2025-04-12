
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, AlertTriangle, Database } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { verifyDatabaseTables } from '@/utils/supabaseDbVerifier';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, user, loading, supabaseConfigured } = useAuth();
  const [databaseStatus, setDatabaseStatus] = useState<{
    checked: boolean;
    success: boolean;
    message: string;
    missingTables: string[];
  }>({
    checked: false,
    success: true,
    message: '',
    missingTables: []
  });

  useEffect(() => {
    const checkDatabase = async () => {
      if (supabaseConfigured) {
        const status = await verifyDatabaseTables();
        setDatabaseStatus({
          checked: true,
          success: status.success,
          message: status.message,
          missingTables: status.missingTables
        });
      }
    };

    checkDatabase();
  }, [supabaseConfigured]);

  // If already logged in, redirect to appropriate dashboard
  if (!loading && user) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">VM Management System</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to sign in
          </CardDescription>
        </CardHeader>
        
        {!supabaseConfigured && (
          <div className="px-6">
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Configuration Error</AlertTitle>
              <AlertDescription>
                Supabase configuration is missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY 
                to your environment variables.
              </AlertDescription>
            </Alert>
          </div>
        )}

        {databaseStatus.checked && !databaseStatus.success && (
          <div className="px-6">
            <Alert variant="destructive" className="mb-4">
              <Database className="h-4 w-4" />
              <AlertTitle>Database Tables Missing</AlertTitle>
              <AlertDescription>
                The following tables are missing from the database: {databaseStatus.missingTables.join(', ')}.
                Please run the schema.sql script in the Supabase SQL editor.
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <Button type="submit" className="w-full">Sign In</Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};

export default Login;
