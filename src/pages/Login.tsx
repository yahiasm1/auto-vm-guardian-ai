
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
import { AlertCircle, Loader2 } from 'lucide-react';
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
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      
      if (error) {
        console.error("Supabase auth error:", error);
        throw error;
      }
      
      console.log("Login successful:", data);
      toast.success('Login successful');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Check if there's a profile for this user
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.id) {
          const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userData.user.id).single();
          console.log("Profile check:", profileData);
          if (!profileData) {
            setErrorMessage('Your account exists but has no profile. Please contact an administrator.');
            return;
          }
        }
      } catch (profileError) {
        console.error("Profile check error:", profileError);
      }
      
      let errorMsg = 'Failed to login. Please check your credentials and try again.';
      if (error.message) {
        errorMsg = error.message;
        
        // Check for common Supabase errors
        if (errorMsg.includes('Invalid login credentials')) {
          errorMsg = 'Invalid email or password. Please try again.';
        }
      }
      
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const fillTestCredentials = (role: 'admin' | 'student') => {
    // Using the correct emails from your authentication system
    const email = role === 'admin' ? 'admin@example.com' : 'student@example.com';
    const password = 'Password123';
    
    form.setValue('email', email);
    form.setValue('password', password);
  };

  const resetPassword = async (role: 'admin' | 'student') => {
    try {
      const email = role === 'admin' ? 'admin@example.com' : 'student@example.com';
      
      setIsLoading(true);
      setErrorMessage(null);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      
      if (error) {
        throw error;
      }
      
      toast.success(`Password reset email sent to ${email}`);
    } catch (error: any) {
      console.error('Password reset error:', error);
      setErrorMessage(`Failed to send password reset: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const createTestAccount = async (role: 'admin' | 'student') => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      // Using the correct emails from your authentication system
      const email = role === 'admin' ? 'admin@example.com' : 'student@example.com';
      const password = 'Password123';
      const fullName = role === 'admin' ? 'Admin Test User' : 'Student Test User';
      const department = role === 'admin' ? 'Administration' : 'Computer Science';
      
      console.log(`Creating or signing in with test ${role} account:`, email);
      
      // First try to sign in with existing account
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          throw error;
        }
        
        toast.success(`Signed in with existing ${role} account`);
        return;
      } catch (signInError: any) {
        console.log(`Sign in failed, will try to create account:`, signInError.message);
        
        // If sign in fails, try to create a new account
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              role: role,
              department: department || '',
            }
          }
        });
        
        if (error) {
          if (error.message.includes("User already registered")) {
            setErrorMessage(`User ${email} exists but with a different password. Try the reset password button.`);
            toast.error(`User ${email} already exists but password may be different.`);
          } else {
            throw error;
          }
        } else if (data.user) {
          console.log(`Test ${role} account created successfully:`, data.user);
          toast.success(`Test ${role} account created! You can now sign in.`);
          setAccountCreated(email);
          
          form.setValue('email', email);
          form.setValue('password', password);
        }
      }
    } catch (error: any) {
      console.error(`Error handling ${role} account:`, error);
      setErrorMessage(`Operation failed: ${error.message}`);
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
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
                  </>
                ) : 'Login'}
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
                Login/Create Admin
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                className="w-full" 
                onClick={() => createTestAccount('student')}
                disabled={isLoading}
              >
                Login/Create Student
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full" 
                onClick={() => resetPassword('admin')}
                disabled={isLoading}
              >
                Reset Admin Pass
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full" 
                onClick={() => resetPassword('student')}
                disabled={isLoading}
              >
                Reset Student Pass
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
