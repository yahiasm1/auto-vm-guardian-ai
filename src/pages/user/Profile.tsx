
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { userService } from '@/services/userService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    role: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const userType = userData?.role === 'admin' ? 'admin' : 'student';

  useEffect(() => {
    if (user) {
      loadUserData(user.id);
    }
  }, [user]);
  
  const loadUserData = async (userId: string) => {
    try {
      setLoading(true);
      const userData = await userService.getUserById(userId);
      setUserData(userData);
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        department: userData.department || '',
        role: userData.role || ''
      });
    } catch (error) {
      console.error("Error loading user data:", error);
      toast('Failed to load user data', {
        description: 'Please try again later',
        style: { backgroundColor: 'rgb(239 68 68)' }
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleProfileUpdate = async () => {
    try {
      if (!user) return;
      
      await userService.updateUser(user.id, {
        name: formData.name,
        department: formData.department
      });
      
      toast('Profile updated', {
        description: 'Your profile has been updated successfully'
      });
      
      // Reload user data to get updated values
      loadUserData(user.id);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast('Failed to update profile', {
        description: 'Please try again later',
        style: { backgroundColor: 'rgb(239 68 68)' }
      });
    }
  };
  
  const handlePasswordChange = async () => {
    try {
      if (!user) return;
      
      // Validate password
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast('Passwords do not match', {
          description: 'New password and confirm password must match',
          style: { backgroundColor: 'rgb(239 68 68)' }
        });
        return;
      }
      
      if (passwordData.newPassword.length < 6) {
        toast('Password too short', {
          description: 'Password must be at least 6 characters',
          style: { backgroundColor: 'rgb(239 68 68)' }
        });
        return;
      }
      
      // Update password
      const { error } = await supabase.auth.updateUser({ 
        password: passwordData.newPassword 
      });
      
      if (error) throw error;
      
      toast('Password updated', {
        description: 'Your password has been updated successfully'
      });
      
      // Clear password fields
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error("Error updating password:", error);
      toast('Failed to update password', {
        description: error.message || 'Please try again later',
        style: { backgroundColor: 'rgb(239 68 68)' }
      });
    }
  };
  
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <DashboardLayout title="User Profile" userType={userType}>
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Loading...
              </span>
            </div>
            <p className="mt-2">Loading profile data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="User Profile" userType={userType}>
      <div className="container mx-auto py-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/3">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Your personal information</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-2xl">{getInitials(userData?.name)}</AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-medium">{userData?.name}</h3>
                <p className="text-muted-foreground">{userData?.email}</p>
                <div className="mt-2 px-4 py-1 bg-primary/10 text-primary rounded-full text-sm">
                  {userData?.role}
                </div>
              </CardContent>
              <CardFooter>
                <div className="w-full">
                  <p className="text-sm text-muted-foreground">
                    Last active: {new Date(userData?.last_active).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Account created: {new Date(userData?.created_at).toLocaleDateString()}
                  </p>
                </div>
              </CardFooter>
            </Card>
          </div>
          
          <div className="w-full md:w-2/3">
            <Tabs defaultValue="details">
              <TabsList className="mb-4">
                <TabsTrigger value="details">Profile Details</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Details</CardTitle>
                    <CardDescription>Update your personal information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        value={formData.email} 
                        disabled 
                        className="bg-muted"
                      />
                      <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input 
                        id="role" 
                        value={formData.role} 
                        disabled 
                        className="bg-muted"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select 
                        value={formData.department}
                        onValueChange={value => setFormData({...formData, department: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Computer Science">Computer Science</SelectItem>
                          <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                          <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                          <SelectItem value="IT">IT</SelectItem>
                          <SelectItem value="External">External</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handleProfileUpdate}>Save Changes</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Update your password</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input 
                        id="currentPassword" 
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input 
                        id="newPassword" 
                        type="password"
                        value={passwordData.newPassword}
                        onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input 
                        id="confirmPassword" 
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      />
                      {passwordData.newPassword && passwordData.confirmPassword && 
                       passwordData.newPassword !== passwordData.confirmPassword && (
                        <p className="text-sm text-red-500">Passwords do not match</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button onClick={handlePasswordChange}>Update Password</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
