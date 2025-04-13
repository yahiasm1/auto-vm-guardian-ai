
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const formSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof formSchema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { signIn, user, profile, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [accountCreated, setAccountCreated] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (user && profile) {
      console.log("User authenticated, redirecting:", { user: user.email, role: profile.role });
      const from = (location.state as any)?.from?.pathname || 
        (profile.role === 'admin' ? '/admin' : '/student');
      navigate(from, { replace: true });
    }
  }, [user, profile, navigate, location]);

  const onSubmit = async (values: FormValues) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      console.log("Attempting login with:", values.email);
      await signIn(values.email, values.password);
    } catch (error: any) {
      console.error('Login error:', error);
      setErrorMessage(error.message || 'Failed to login. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillTestCredentials = (role: 'admin' | 'student') => {
    const email = role === 'admin' ? 'admin1@example.com' : 'student1@example.com';
    const password = 'Password123';
    
    form.setValue('email', email);
    form.setValue('password', password);
  };

  const createTestAccount = async (role: 'admin' | 'student') => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      const email = role === 'admin' ? 'admin1@example.com' : 'student1@example.com';
      const password = 'Password123';
      const fullName = role === 'admin' ? 'Admin Test User' : 'Student Test User';
      const department = role === 'admin' ? 'Administration' : 'Computer Science';
      
      console.log(`Creating test ${role} account:`, email);
      
      try {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        
        if (signInData?.user) {
          console.log(`User ${email} already exists and password is correct`);
          toast.success(`Test ${role} account exists! Signing you in...`);
          setAccountCreated(email);
          
          form.setValue('email', email);
          form.setValue('password', password);
          
          await signIn(email, password);
          return;
        }
      } catch (signInError) {
        console.log("Sign in check result:", signInError);
      }
      
      try {
        const result = await signUp(email, password, fullName, role, department);
        
        if (result && result.user) {
          console.log(`Test ${role} account created successfully:`, result.user);
          toast.success(`Test ${role} account created! You can now sign in.`);
          setAccountCreated(email);
          
          form.setValue('email', email);
          form.setValue('password', password);
        }
      } catch (error: any) {
        console.log("Error during signup:", error);
        
        if (error.message?.includes("already registered") || 
            error.message?.includes("duplicate key") || 
            error.message?.includes("Database error saving") ||
            error.message?.includes("Email already registered")) {
          
          console.log(`User ${email} seems to exist but with different password`);
          toast.info(`User ${email} already exists but may have a different password. Try signing in with password "Password123".`);
          setAccountCreated(email);
          form.setValue('email', email);
          form.setValue('password', password);
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error(`Error creating test ${role} account:`, error);
      setErrorMessage(`Failed to create test ${role} account: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
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
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4 flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
          
          {accountCreated && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-md mb-4">
              Account created with email: {accountCreated}. You can now sign in.
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="name@example.com" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Login'}
              </Button>
            </form>
          </Form>

          <div className="mt-6 space-y-2">
            <p className="text-sm text-center text-muted-foreground">Test accounts</p>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full" 
                onClick={() => fillTestCredentials('admin')}
              >
                Fill Admin User
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full" 
                onClick={() => fillTestCredentials('student')}
              >
                Fill Student User
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-full" 
                onClick={() => createTestAccount('admin')}
                disabled={isLoading}
              >
                Create Admin User
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-full" 
                onClick={() => createTestAccount('student')}
                disabled={isLoading}
              >
                Create Student User
              </Button>
            </div>
          </div>
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
