import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { VmCard, VMStatus } from '@/components/Dashboard/VmCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Server, Activity, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { vmService } from '@/services/vmService';
import { resourceService } from '@/services/resourceService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { VirtualMachine } from '@/services/vmService';
import { ResourceUsageChart } from '@/components/Dashboard/ResourceUsageChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define our VM type for TypeScript that matches what we get from the API
interface StudentVM {
  id: string;
  name: string;
  os: string;
  status: VMStatus;
  cpu: number;
  ram: number;
  storage: number;
  ip?: string;
  course?: string;
  user_id: string;
  created_at?: string;
  last_updated?: string;
}

// Resource usage data for the VM
interface ResourceUsage {
  cpu: number;
  ram: number;
  storage: number;
  timestamp: string;
}

const StudentVms: React.FC = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedVM, setSelectedVM] = useState<string | null>(null);
  const [resourcesTab, setResourcesTab] = useState<string>('usage');
  const [showConsole, setShowConsole] = useState<boolean>(false);

  const {
    data: studentVMs = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['studentVirtualMachines', user?.id],
    queryFn: () => vmService.getVMsByUserId(user?.id || ''),
    enabled: !!user?.id
  });
  
  const {
    data: resourceData = [],
    isLoading: isLoadingResources
  } = useQuery({
    queryKey: ['vmResources', selectedVM],
    queryFn: () => resourceService.getResourceTimeline(user?.id || '', 24),
    enabled: !!user?.id && !!selectedVM
  });

  useEffect(() => {
    if (error) {
      toast.error('Failed to load your virtual machines', { 
        description: 'Please try again later or contact support.' 
      });
      console.error('Error fetching student VMs:', error);
    }
  }, [error]);

  // Cast the VM data from API to our expected type with proper status typing
  const typedVMs: StudentVM[] = studentVMs.map((vm: VirtualMachine) => ({
    ...vm,
    status: vm.status as VMStatus
  }));

  const filteredVMs = typedVMs.filter((vm: StudentVM) => {
    const matchesSearch = vm.name.toLowerCase().includes(search.toLowerCase()) ||
                        vm.os.toLowerCase().includes(search.toLowerCase()) ||
                        vm.course?.toLowerCase().includes(search.toLowerCase()) ||
                        vm.ip?.includes(search);
    
    const matchesStatus = statusFilter === 'all' || vm.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = () => {
    // Refetch VM data when status changes
    refetch();
  };

  const openConsole = (vmId: string) => {
    setSelectedVM(vmId);
    setShowConsole(true);
  };

  // Sample resource usage data for demo purposes
  // In a real implementation, this would come from the API
  const sampleResourceData = [
    { name: '00:00', cpu: 10, ram: 25, storage: 40 },
    { name: '03:00', cpu: 15, ram: 25, storage: 40 },
    { name: '06:00', cpu: 18, ram: 28, storage: 40 },
    { name: '09:00', cpu: 35, ram: 35, storage: 40 },
    { name: '12:00', cpu: 45, ram: 45, storage: 41 },
    { name: '15:00', cpu: 55, ram: 48, storage: 41 },
    { name: '18:00', cpu: 65, ram: 50, storage: 41 },
    { name: '21:00', cpu: 45, ram: 40, storage: 42 },
    { name: 'Now', cpu: 30, ram: 35, storage: 42 },
  ];

  return (
    <DashboardLayout title="My Virtual Machines" userType="student">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold">My Virtual Machines</h2>
          <p className="text-slate-600 dark:text-slate-300 mt-1">
            Manage and access your course virtual machines.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative grow max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search VMs by name, OS, or course..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="stopped">Stopped</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* VM List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8">
            <Server size={48} className="text-muted-foreground animate-pulse mb-4" />
            <p className="text-muted-foreground">Loading your virtual machines...</p>
          </div>
        ) : (
          <>
            {filteredVMs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredVMs.map((vm: StudentVM) => (
                  <VmCard 
                    key={vm.id} 
                    id={vm.id}
                    name={vm.name}
                    os={vm.os}
                    status={vm.status}
                    cpu={vm.cpu}
                    ram={vm.ram}
                    storage={vm.storage}
                    ip={vm.ip}
                    isStudent={true}
                    onStatusChange={handleStatusChange}
                    onConnect={openConsole}
                  />
                ))}
              </div>
            ) : (
              <div className="col-span-full p-8 text-center border rounded-lg">
                {error ? (
                  <div className="flex flex-col items-center justify-center">
                    <Activity size={48} className="text-red-500 mb-4" />
                    <p className="text-muted-foreground">
                      Error loading your virtual machines. Please try again.
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    {search || statusFilter !== 'all' 
                      ? 'No virtual machines match your filters.' 
                      : 'You don\'t have any virtual machines yet.'}
                  </p>
                )}
              </div>
            )}
          </>
        )}

        {/* Resource Usage Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Resource Usage Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResourceUsageChart 
                title="Resource Usage (24h)" 
                data={sampleResourceData} 
                height={250}
              />
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Resource Allocation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>CPU Usage</span>
                        <span>30% (Average)</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-vmSystem-blue w-[30%]" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Memory Usage</span>
                        <span>35% (Average)</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 w-[35%]" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Storage Usage</span>
                        <span>42% (Average)</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 w-[42%]" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Network Configuration */}
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Network Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h3 className="font-medium mb-1">Network Type</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">Bridged Networking</p>
                <p className="text-xs text-slate-500 mt-1">
                  Your VMs are directly accessible on the school network
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-1">IP Assignment</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">DHCP (Automatic)</p>
                <p className="text-xs text-slate-500 mt-1">
                  IP addresses are automatically assigned when VMs start
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-1">DNS Configuration</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">Automatic</p>
                <p className="text-xs text-slate-500 mt-1">
                  Domain names are hostname.student.cs.university.edu
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usage Tips */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold mb-2">VM Usage Tips</h3>
          <ul className="list-disc list-inside text-sm space-y-1 text-slate-600 dark:text-slate-300">
            <li>Remember to stop VMs when not in use to conserve resources</li>
            <li>Use the "Connect" button to access your VM through a browser-based terminal</li>
            <li>All work on VMs is saved automatically, but consider backing up important files</li>
            <li>If you encounter any issues, contact your course instructor or IT support</li>
          </ul>
        </div>
      </div>

      {/* Web Console Modal */}
      <Sheet open={showConsole} onOpenChange={setShowConsole}>
        <SheetContent side="right" className="w-[90%] sm:w-[540px] md:w-[720px] p-0">
          <SheetHeader className="p-6 border-b">
            <SheetTitle>
              {selectedVM && filteredVMs.find(vm => vm.id === selectedVM)?.name} - Web Console
            </SheetTitle>
          </SheetHeader>
          
          <Tabs defaultValue="console" className="p-6">
            <TabsList className="mb-4">
              <TabsTrigger value="console">Console</TabsTrigger>
              <TabsTrigger value="info">VM Information</TabsTrigger>
            </TabsList>
            
            <TabsContent value="console" className="p-0">
              <div className="bg-black text-green-400 font-mono p-4 h-[500px] overflow-auto rounded border border-gray-700">
                <div className="mb-2">[root@vm ~]# Connection established to virtual machine</div>
                <div className="mb-2">[root@vm ~]# Welcome to Linux VM Console</div>
                <div className="mb-2">[root@vm ~]# Type 'help' for a list of commands</div>
                <div className="mb-2">[root@vm ~]# </div>
                <div className="flex items-center">
                  <span className="mr-2">[root@vm ~]#</span>
                  <div className="animate-pulse">_</div>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                This is a simulated console. In production, this would be a real terminal connection.
              </p>
            </TabsContent>
            
            <TabsContent value="info" className="p-0">
              {selectedVM && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm text-slate-500">VM Name</h3>
                    <p>{filteredVMs.find(vm => vm.id === selectedVM)?.name}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm text-slate-500">Operating System</h3>
                    <p>{filteredVMs.find(vm => vm.id === selectedVM)?.os}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm text-slate-500">IP Address</h3>
                    <p>{filteredVMs.find(vm => vm.id === selectedVM)?.ip || 'Not assigned'}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm text-slate-500">VM Status</h3>
                    <p>{filteredVMs.find(vm => vm.id === selectedVM)?.status}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm text-slate-500">Connection Methods</h3>
                    <div className="mt-2 space-y-2">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded border">
                        <h4 className="font-medium">SSH Command</h4>
                        <code className="block bg-slate-100 dark:bg-slate-700 p-2 rounded mt-1 text-xs">
                          ssh student@{filteredVMs.find(vm => vm.id === selectedVM)?.ip || 'vm-ip-address'}
                        </code>
                      </div>
                      
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded border">
                        <h4 className="font-medium">RDP Information (for Windows VMs)</h4>
                        <p className="text-sm mt-1">Server: {filteredVMs.find(vm => vm.id === selectedVM)?.ip || 'vm-ip-address'}</p>
                        <p className="text-sm">Username: student</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default StudentVms;
