
import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface TestAccountsProps {
  onSetCredentials?: (email: string, password: string) => void;
}

const TestAccountsSection: React.FC<TestAccountsProps> = ({ onSetCredentials = () => {} }) => {
  const testAccounts = [
    { role: 'Admin', email: 'admin@example.com', password: 'admin123' },
    { role: 'Student', email: 'student@example.com', password: 'student123' }
  ];

  const handleUseTestAccount = (email: string, password: string) => {
    try {
      onSetCredentials(email, password);
      toast.success(`Credentials set for ${email}`);
    } catch (error) {
      const emailForError = email; // Define within the catch block
      toast.error(`Failed to set credentials for ${emailForError}`);
    }
  };

  return (
    <div className="mt-6">
      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white dark:bg-slate-800 px-2 text-muted-foreground">
            Test Accounts
          </span>
        </div>
      </div>
      
      <div className="grid gap-2">
        {testAccounts.map((account) => (
          <div key={account.email} className="flex items-center justify-between p-2 border rounded text-sm">
            <div>
              <p className="font-medium">{account.role}</p>
              <p className="text-xs text-muted-foreground">{account.email}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUseTestAccount(account.email, account.password)}
            >
              Use
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestAccountsSection;
