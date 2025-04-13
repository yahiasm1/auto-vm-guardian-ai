
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';

interface TestAccountsSectionProps {
  onSetCredentials: (email: string, password: string) => void;
}

const TestAccountsSection = ({ onSetCredentials }: TestAccountsSectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accountCreated, setAccountCreated] = useState<string | null>(null);
  const { signIn } = useAuth();

  const fillTestCredentials = (role: 'admin' | 'student') => {
    // Using the correct emails from your authentication system
    const email = role === 'admin' ? 'admin@example.com' : 'student@example.com';
    const password = 'Password123';
    
    onSetCredentials(email, password);
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
      
      console.log(`Creating test ${role} account:`, email);
      
      // Create a new account
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
          // User exists, try to sign in
          toast.info(`${role} account already exists, attempting to sign in...`);
          
          try {
            await signIn(email, password);
            toast.success(`Signed in as ${email}`);
            return;
          } catch (signInError: any) {
            setErrorMessage(`User ${email} exists but could not sign in: ${signInError.message}`);
            return;
          }
        } else {
          throw error;
        }
      } else if (data.user) {
        console.log(`Test ${role} account created successfully:`, data.user);
        toast.success(`Test ${role} account created! You can now sign in.`);
        setAccountCreated(email);
        
        onSetCredentials(email, password);
      }
    } catch (error: any) {
      console.error(`Error handling ${role} account:`, error);
      setErrorMessage(`Operation failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-6 space-y-2">
      {errorMessage && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-4">
          {errorMessage}
        </div>
      )}
      
      {accountCreated && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-md mb-4">
          Account created with email: {accountCreated}. You can now sign in.
        </div>
      )}

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
          Create/Login Admin
        </Button>
        <Button 
          variant="secondary" 
          size="sm" 
          className="w-full" 
          onClick={() => createTestAccount('student')}
          disabled={isLoading}
        >
          Create/Login Student
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
  );
};

export default TestAccountsSection;
