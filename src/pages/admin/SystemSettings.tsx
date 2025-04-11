
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Save,
  Shield, 
  Bell,
  MailWarning,
  ClipboardCheck,
  Wrench,
  RefreshCw,
  AlertTriangle,
  Database,
  Server,
  Calendar,
  Users
} from 'lucide-react';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';

interface SystemSettingsForm {
  siteName: string;
  siteUrl: string;
  adminEmail: string;
  maxVmPerUser: number;
  defaultCpuLimit: number;
  defaultRamLimit: number;
  defaultStorageLimit: number;
  enableUserRegistration: boolean;
  enableAutoShutdown: boolean;
  enableVMSnapshots: boolean;
  theme: 'light' | 'dark' | 'system';
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  sessionTimeout: number;
  notificationEmails: string;
  maintenanceMode: boolean;
  timezone: string;
}

interface BackupItem {
  id: string;
  date: string;
  size: string;
  type: 'manual' | 'automatic';
  status: string;
}

const initialSettings: SystemSettingsForm = {
  siteName: 'VM Guardian',
  siteUrl: 'https://vmguardian.example.edu',
  adminEmail: 'admin@example.edu',
  maxVmPerUser: 5,
  defaultCpuLimit: 4,
  defaultRamLimit: 8,
  defaultStorageLimit: 100,
  enableUserRegistration: true,
  enableAutoShutdown: true,
  enableVMSnapshots: true,
  theme: 'system',
  backupFrequency: 'daily',
  sessionTimeout: 30,
  notificationEmails: 'admin@example.edu, alerts@example.edu',
  maintenanceMode: false,
  timezone: 'America/New_York'
};

const backups: BackupItem[] = [
  { id: '1', date: '2023-04-10 02:00:00', size: '15.2 GB', type: 'automatic', status: 'completed' },
  { id: '2', date: '2023-04-09 02:00:00', size: '15.1 GB', type: 'automatic', status: 'completed' },
  { id: '3', date: '2023-04-08 02:00:00', size: '15.0 GB', type: 'automatic', status: 'completed' },
  { id: '4', date: '2023-04-07 02:00:00', size: '14.9 GB', type: 'automatic', status: 'completed' },
  { id: '5', date: '2023-04-06 14:30:00', size: '14.8 GB', type: 'manual', status: 'completed' },
];

const timezones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Asia/Singapore',
  'Australia/Sydney',
  'Pacific/Auckland'
];

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettingsForm>(initialSettings);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [isConfirmResetDialogOpen, setIsConfirmResetDialogOpen] = useState(false);

  const handleSettingChange = <K extends keyof SystemSettingsForm>(key: K, value: SystemSettingsForm[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    setIsUpdatingSettings(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsUpdatingSettings(false);
      toast('Settings Saved', {
        description: 'System settings have been updated successfully.'
      });
    }, 1000);
  };

  const handleResetSettings = () => {
    setSettings(initialSettings);
    setIsConfirmResetDialogOpen(false);
    
    toast('Settings Reset', {
      description: 'System settings have been reset to defaults.'
    });
  };

  const handleBackupNow = () => {
    setIsBackingUp(true);
    setBackupProgress(0);
    
    // Simulate backup process
    const interval = setInterval(() => {
      setBackupProgress(prev => {
        const newProgress = prev + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsBackingUp(false);
          
          toast('Backup Completed', {
            description: 'System backup has been created successfully.'
          });
          
          return 100;
        }
        return newProgress;
      });
    }, 500);
  };

  const handleMaintenanceToggle = () => {
    const newValue = !settings.maintenanceMode;
    
    handleSettingChange('maintenanceMode', newValue);
    
    toast(newValue ? 'Maintenance Mode Enabled' : 'Maintenance Mode Disabled', {
      description: newValue 
        ? 'Users will see a maintenance page when they try to access the system.' 
        : 'The system is now accessible to all users.'
    });
  };

  return (
    <DashboardLayout title="System Settings" userType="admin">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">System Settings</h2>
          <div className="flex gap-2">
            <Dialog 
              open={isConfirmResetDialogOpen} 
              onOpenChange={setIsConfirmResetDialogOpen}
            >
              <DialogTrigger asChild>
                <Button variant="outline">
                  <RefreshCw size={16} className="mr-2" />
                  Reset to Defaults
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reset Settings</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-destructive flex items-center">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    This will reset all system settings to their default values.
                  </p>
                  <p className="mt-2">Are you sure you want to continue?</p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsConfirmResetDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleResetSettings}
                  >
                    Reset Settings
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            
            <Button 
              onClick={handleSaveSettings} 
              disabled={isUpdatingSettings}
            >
              {isUpdatingSettings ? (
                <>
                  <RefreshCw size={16} className="mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="general" className="flex items-center">
              <Settings size={16} className="mr-2" />
              General
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center">
              <Server size={16} className="mr-2" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center">
              <Shield size={16} className="mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="backups" className="flex items-center">
              <Database size={16} className="mr-2" />
              Backups
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center">
              <Bell size={16} className="mr-2" />
              Notifications
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Basic configuration for your VM Guardian installation.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="siteName" className="text-sm font-medium">Site Name</label>
                    <Input 
                      id="siteName" 
                      value={settings.siteName} 
                      onChange={(e) => handleSettingChange('siteName', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">The name displayed in the browser title and header.</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="siteUrl" className="text-sm font-medium">Site URL</label>
                    <Input 
                      id="siteUrl" 
                      value={settings.siteUrl} 
                      onChange={(e) => handleSettingChange('siteUrl', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">The full URL of your VM Guardian installation.</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="adminEmail" className="text-sm font-medium">Admin Email</label>
                    <Input 
                      id="adminEmail" 
                      type="email" 
                      value={settings.adminEmail} 
                      onChange={(e) => handleSettingChange('adminEmail', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">The primary administrator email address.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="timezone" className="text-sm font-medium">Timezone</label>
                    <Select 
                      value={settings.timezone} 
                      onValueChange={(value) => handleSettingChange('timezone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">System default timezone for logs and scheduling.</p>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="theme" className="text-sm font-medium">Default Theme</label>
                    <Select 
                      value={settings.theme} 
                      onValueChange={(value: 'light' | 'dark' | 'system') => handleSettingChange('theme', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select theme" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="dark">Dark</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">The default theme for all users.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Maintenance Mode</label>
                        <p className="text-xs text-muted-foreground">Temporarily disable access for non-admin users.</p>
                      </div>
                      <Switch 
                        checked={settings.maintenanceMode} 
                        onCheckedChange={handleMaintenanceToggle}
                      />
                    </div>
                    
                    {settings.maintenanceMode && (
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 w-fit">
                        <AlertTriangle size={14} className="mr-1" />
                        Maintenance Mode Active
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resource Settings */}
          <TabsContent value="resources">
            <Card>
              <CardHeader>
                <CardTitle>Resource Allocation Settings</CardTitle>
                <CardDescription>Configure default resource limits for virtual machines.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="maxVmPerUser" className="text-sm font-medium">Max VMs Per User</label>
                      <span className="text-sm font-medium">{settings.maxVmPerUser}</span>
                    </div>
                    <Slider
                      id="maxVmPerUser"
                      min={1}
                      max={10}
                      step={1}
                      value={[settings.maxVmPerUser]}
                      onValueChange={(value) => handleSettingChange('maxVmPerUser', value[0])}
                    />
                    <p className="text-xs text-muted-foreground">Maximum number of VMs a student can create.</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="defaultCpuLimit" className="text-sm font-medium">Default CPU Cores</label>
                      <span className="text-sm font-medium">{settings.defaultCpuLimit} cores</span>
                    </div>
                    <Slider
                      id="defaultCpuLimit"
                      min={1}
                      max={16}
                      step={1}
                      value={[settings.defaultCpuLimit]}
                      onValueChange={(value) => handleSettingChange('defaultCpuLimit', value[0])}
                    />
                    <p className="text-xs text-muted-foreground">Default number of CPU cores per VM.</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="defaultRamLimit" className="text-sm font-medium">Default RAM Size</label>
                      <span className="text-sm font-medium">{settings.defaultRamLimit} GB</span>
                    </div>
                    <Slider
                      id="defaultRamLimit"
                      min={1}
                      max={32}
                      step={1}
                      value={[settings.defaultRamLimit]}
                      onValueChange={(value) => handleSettingChange('defaultRamLimit', value[0])}
                    />
                    <p className="text-xs text-muted-foreground">Default RAM allocation per VM in GB.</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="defaultStorageLimit" className="text-sm font-medium">Default Storage Size</label>
                      <span className="text-sm font-medium">{settings.defaultStorageLimit} GB</span>
                    </div>
                    <Slider
                      id="defaultStorageLimit"
                      min={10}
                      max={500}
                      step={10}
                      value={[settings.defaultStorageLimit]}
                      onValueChange={(value) => handleSettingChange('defaultStorageLimit', value[0])}
                    />
                    <p className="text-xs text-muted-foreground">Default storage allocation per VM in GB.</p>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Enable Auto-Shutdown</label>
                        <p className="text-xs text-muted-foreground">Automatically shut down idle VMs after period of inactivity.</p>
                      </div>
                      <Switch 
                        checked={settings.enableAutoShutdown} 
                        onCheckedChange={(checked) => handleSettingChange('enableAutoShutdown', checked)}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Enable VM Snapshots</label>
                        <p className="text-xs text-muted-foreground">Allow users to create and restore VM snapshots.</p>
                      </div>
                      <Switch 
                        checked={settings.enableVMSnapshots} 
                        onCheckedChange={(checked) => handleSettingChange('enableVMSnapshots', checked)}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Configure security and access control settings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label htmlFor="sessionTimeout" className="text-sm font-medium">Session Timeout (minutes)</label>
                      <span className="text-sm font-medium">{settings.sessionTimeout}</span>
                    </div>
                    <Slider
                      id="sessionTimeout"
                      min={5}
                      max={120}
                      step={5}
                      value={[settings.sessionTimeout]}
                      onValueChange={(value) => handleSettingChange('sessionTimeout', value[0])}
                    />
                    <p className="text-xs text-muted-foreground">User sessions will expire after this period of inactivity.</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Enable User Registration</label>
                        <p className="text-xs text-muted-foreground">Allow users to create their own accounts.</p>
                      </div>
                      <Switch 
                        checked={settings.enableUserRegistration} 
                        onCheckedChange={(checked) => handleSettingChange('enableUserRegistration', checked)}
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6 mt-6">
                  <h3 className="text-lg font-medium mb-4">Security Recommendations</h3>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="bg-green-100 text-green-800 p-2 rounded-full mr-3">
                        <ClipboardCheck size={16} />
                      </div>
                      <div>
                        <p className="font-medium">Two-Factor Authentication</p>
                        <p className="text-sm text-muted-foreground">2FA is enabled for administrator accounts.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="bg-amber-100 text-amber-800 p-2 rounded-full mr-3">
                        <AlertTriangle size={16} />
                      </div>
                      <div>
                        <p className="font-medium">Password Policy</p>
                        <p className="text-sm text-muted-foreground">Current password policy requires strengthening.</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="bg-amber-100 text-amber-800 p-2 rounded-full mr-3">
                        <MailWarning size={16} />
                      </div>
                      <div>
                        <p className="font-medium">Email Verification</p>
                        <p className="text-sm text-muted-foreground">Email verification is not required for new accounts.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backup Settings */}
          <TabsContent value="backups">
            <Card>
              <CardHeader>
                <CardTitle>Backup Settings</CardTitle>
                <CardDescription>Configure system backup settings and restore points.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="backupFrequency" className="text-sm font-medium">Backup Frequency</label>
                    <Select 
                      value={settings.backupFrequency} 
                      onValueChange={(value: 'daily' | 'weekly' | 'monthly') => handleSettingChange('backupFrequency', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select backup frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">How often the system should create automatic backups.</p>
                  </div>

                  <div className="space-y-2 flex items-end">
                    <Button 
                      className="w-full" 
                      onClick={handleBackupNow}
                      disabled={isBackingUp}
                    >
                      <Database size={16} className="mr-2" />
                      {isBackingUp ? "Backing up..." : "Backup Now"}
                    </Button>
                  </div>

                  {isBackingUp && (
                    <div className="col-span-1 md:col-span-2 space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>Creating backup...</span>
                        <span>{backupProgress}%</span>
                      </div>
                      <Progress value={backupProgress} className="h-2" />
                    </div>
                  )}
                </div>

                <div className="border-t pt-6 mt-4">
                  <h3 className="text-lg font-medium mb-4">Recent Backups</h3>
                  <div className="rounded-md border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="py-2 px-4 text-left font-medium">Backup Date</th>
                          <th className="py-2 px-4 text-left font-medium">Size</th>
                          <th className="py-2 px-4 text-left font-medium">Type</th>
                          <th className="py-2 px-4 text-left font-medium">Status</th>
                          <th className="py-2 px-4 text-left font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {backups.map(backup => (
                          <tr key={backup.id} className="border-b">
                            <td className="py-2 px-4">{backup.date}</td>
                            <td className="py-2 px-4">{backup.size}</td>
                            <td className="py-2 px-4">
                              <Badge variant="outline" className="capitalize">
                                {backup.type}
                              </Badge>
                            </td>
                            <td className="py-2 px-4">
                              <Badge className="bg-green-100 text-green-800">
                                {backup.status}
                              </Badge>
                            </td>
                            <td className="py-2 px-4">
                              <Button variant="ghost" size="sm">
                                Restore
                              </Button>
                              <Button variant="ghost" size="sm" className="text-destructive">
                                Delete
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>Configure system notifications and alerts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="notificationEmails" className="text-sm font-medium">Notification Email Addresses</label>
                  <Textarea 
                    id="notificationEmails" 
                    value={settings.notificationEmails} 
                    onChange={(e) => handleSettingChange('notificationEmails', e.target.value)}
                    placeholder="Enter email addresses, separated by commas"
                    className="h-24"
                  />
                  <p className="text-xs text-muted-foreground">System alerts will be sent to these email addresses.</p>
                </div>

                <div className="border-t pt-6 mt-4">
                  <h3 className="text-lg font-medium mb-4">Notification Events</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">VM Creation/Deletion</label>
                        <p className="text-xs text-muted-foreground">Send notifications when VMs are created or deleted.</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Resource Threshold Alerts</label>
                        <p className="text-xs text-muted-foreground">Send alerts when resource usage exceeds thresholds.</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">User Account Changes</label>
                        <p className="text-xs text-muted-foreground">Send notifications for user account creations or modifications.</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">System Errors</label>
                        <p className="text-xs text-muted-foreground">Send notifications for system errors and warnings.</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Backup Status</label>
                        <p className="text-xs text-muted-foreground">Send notifications about backup success or failure.</p>
                      </div>
                      <Switch defaultChecked={true} />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium">Maintenance Updates</label>
                        <p className="text-xs text-muted-foreground">Send notifications about system maintenance.</p>
                      </div>
                      <Switch defaultChecked={false} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SystemSettings;
