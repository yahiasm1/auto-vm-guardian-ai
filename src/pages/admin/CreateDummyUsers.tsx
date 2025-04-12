
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { authService } from '@/services/authService';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const CreateDummyUsers: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const navigate = useNavigate();
  
  const handleCreateDummyUsers = async () => {
    setLoading(true);
    try {
      const result = await authService.createDummyAuthUsers();
      setResults(result.results || []);
      toast.success('Dummy auth users created');
    } catch (error: any) {
      toast.error(`Error creating dummy users: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container py-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Create Dummy Auth Users</CardTitle>
            <CardDescription>
              This utility will create auth users for all the dummy data in the users table.
              This allows you to sign in as these users with the default password.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Alert className="mb-4">
              <AlertTitle>Important Information</AlertTitle>
              <AlertDescription>
                All dummy users will be created with the password: <strong>password123</strong>
              </AlertDescription>
            </Alert>
            
            {results.length > 0 && (
              <div className="mt-4 border rounded-md p-4">
                <h3 className="font-medium mb-2">Results:</h3>
                <ul className="space-y-1">
                  {results.map((result, index) => (
                    <li key={index} className="flex items-center">
                      <span className="mr-2">{result.email}:</span>
                      <span className={result.status === 'error' ? 'text-red-500' : 
                                      result.status === 'already_exists' ? 'text-yellow-500' : 'text-green-500'}>
                        {result.status}
                        {result.message ? ` - ${result.message}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate('/admin')}>
              Back to Dashboard
            </Button>
            <Button onClick={handleCreateDummyUsers} disabled={loading}>
              {loading ? 'Creating Users...' : 'Create Dummy Auth Users'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default CreateDummyUsers;
