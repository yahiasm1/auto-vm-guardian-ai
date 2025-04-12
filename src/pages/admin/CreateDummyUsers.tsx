
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/services/authService';
import { toast } from 'sonner';

const CreateDummyUsers = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleCreateDummyUsers = async () => {
    try {
      setIsCreating(true);
      const data = await authService.createDummyAuthUsers();
      setResults(data);
      toast.success('Dummy auth users created successfully');
    } catch (error: any) {
      console.error('Failed to create dummy auth users:', error);
      toast.error('Failed to create dummy auth users', {
        description: error.message
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <DashboardLayout title="Create Dummy Auth Users" userType="admin">
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Authentication Users</CardTitle>
            <CardDescription>
              This will create Supabase authentication accounts for all users in the database.
              This is useful for setting up test accounts without having to manually create them.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Each user will be created with the default password: <code>password123</code>
            </p>
            
            {results && (
              <div className="mt-4 p-4 bg-slate-100 rounded-md">
                <h3 className="font-medium mb-2">Results:</h3>
                <pre className="text-xs overflow-auto max-h-60">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleCreateDummyUsers}
              disabled={isCreating}
            >
              {isCreating ? 'Creating Users...' : 'Create Auth Users'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateDummyUsers;
