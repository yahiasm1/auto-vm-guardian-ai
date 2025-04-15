
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import api from '@/services/api';

type PasswordFormValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export function SecurityTab() {
  const form = useForm<PasswordFormValues>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    }
  });
  
  const onSubmit = async (data: PasswordFormValues) => {
    try {
      if (data.newPassword !== data.confirmPassword) {
        toast.error('New passwords do not match');
        return;
      }
      
      // Make an API call to update password
      await api.post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      });
      
      // Reset form
      form.reset();
      toast.success('Password updated successfully');
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to update password');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>
          Change your password and security settings
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter current password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter new password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Confirm new password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full">
              Change Password
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
