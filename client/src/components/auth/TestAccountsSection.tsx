
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/lib/auth';

interface TestAccountsSectionProps {
  onSetCredentials: (email: string, password: string) => void;
}

const TestAccountsSection = ({ onSetCredentials }: TestAccountsSectionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accountCreated, setAccountCreated] = useState<string | null>(null);
  const { signIn, signUp } = useAuth();

  const fillTestCredentials = (role: 'admin' | 'student') => {
    const email = role === 'admin' ? 'admin@example.com' : 'student@example.com';
    const password = role === 'admin' ? 'admin123' : 'student123';
    
    onSetCredentials(email, password);
  };

  const resetPassword = async (role: 'admin' | 'student') => {
    try {
      const email = role === 'admin' ? 'admin@example.com' : 'student@example.com';
      
      setIsLoading(true);
      setErrorMessage(null);
      
      toast.info(`Password reset functionality is not available in the current setup.`);
      
    } catch (error: any) {
      console.error('Password reset error:', error);
      setErrorMessage(`Failed to reset password: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithTestAccount = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      console.log(`Trying to sign in with ${email}`);
      
      await signIn(email, password);
      toast.success(`Signed in as ${email}`);
      return true;
    } catch (error: any) {
      console.error(`Login error with ${email}:`, error);
      if (error.message.includes("Invalid credentials")) {
        return false;
      }
      setErrorMessage(`Could not sign in: ${error.message}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const createTestAccount = async (role: 'admin' | 'student') => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      const email = role === 'admin' ? 'admin@example.com' : 'student@example.com';
      const password = role === 'admin' ? 'admin123' : 'student123';
      const fullName = role === 'admin' ? 'Admin Test User' : 'Student Test User';
      const department = role === 'admin' ? 'Administration' : 'Computer Science';
      
      console.log(`Creating/logging in test ${role} account: ${email}`);
      
      const loginSuccess = await loginWithTestAccount(email, password);
      
      if (loginSuccess) {
        return;
      }
      
      console.log('Login failed, attempting to create account');
      
      await signUp(email, password, fullName, role, department);
      
      toast.success(`Test ${role} account created! You can now sign in.`);
      setAccountCreated(email);
      
      onSetCredentials(email, password);
      
    } catch (error: any) {
      console.error(`Error handling ${role} account:`, error);
      
      // Properly define the email variable to resolve the TS2304 error
      const emailForError = role === 'admin' ? 'admin@example.com' : 'student@example.com';
      
      if (error.message.includes("already in use")) {
        setErrorMessage(`Account ${emailForError} exists but password may be different. Try the reset password option.`);
      } else {
        setErrorMessage(`Operation failed: ${error.message}`);
      }
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
