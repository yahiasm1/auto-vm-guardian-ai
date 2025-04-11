
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { VmCard, VMStatus } from '@/components/Dashboard/VmCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Server, Activity } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { vmService } from '@/services/vmService';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

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

const StudentVms: React.FC = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

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

  useEffect(() => {
    if (error) {
      toast.error('Failed to load your virtual machines', { 
        description: 'Please try again later or contact support.' 
      });
      console.error('Error fetching student VMs:', error);
    }
  }, [error]);

  const filteredVMs = studentVMs.filter((vm: StudentVM) => {
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
                    status={vm.status as VMStatus}
                    cpu={vm.cpu}
                    ram={vm.ram}
                    storage={vm.storage}
                    ip={vm.ip}
                    isStudent={true}
                    onStatusChange={handleStatusChange}
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
    </DashboardLayout>
  );
};

export default StudentVms;
