
import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { VmCard, VMStatus } from '@/components/Dashboard/VmCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { VmCreationForm } from '@/components/Forms/VmCreationForm';
import { PlusCircle, Search, Filter, DownloadCloud, Server, Activity } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { vmService } from '@/services/vmService';
import { toast } from 'sonner';

// Define our VM type for TypeScript
interface VM {
  id: string;
  name: string;
  os: string;
  status: VMStatus;
  cpu: number;
  ram: number;
  storage: number;
  ip?: string;
  user_id: string;
  course?: string;
}

const VmManagement: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const {
    data: vms = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['virtualMachines'],
    queryFn: vmService.getAllVMs,
  });
  
  useEffect(() => {
    if (error) {
      toast.error('Failed to load virtual machines', {
        description: 'There was a problem connecting to the server.',
      });
      console.error('Error fetching VMs:', error);
    }
  }, [error]);

  const filteredVMs = vms.filter((vm: VM) => {
    const matchesSearch = vm.name.toLowerCase().includes(search.toLowerCase()) ||
                       vm.os.toLowerCase().includes(search.toLowerCase()) ||
                       vm.ip?.includes(search);
    
    const matchesStatus = statusFilter === 'all' || vm.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateVM = (data: any) => {
    try {
      setDialogOpen(false);
      // Form submission is handled by the form component itself
      // But we can refetch the VM list after creation
      setTimeout(() => {
        refetch();
      }, 1000);
    } catch (error) {
      console.error('Error creating VM:', error);
    }
  };

  const handleStatusChange = () => {
    // Refetch VM data when status changes
    refetch();
  };

  const handleExportCSV = () => {
    try {
      // Create CSV content
      const headers = ['Name', 'OS', 'Status', 'CPU', 'RAM (GB)', 'Storage (GB)', 'IP Address'];
      const csvContent = [
        headers.join(','),
        ...filteredVMs.map((vm: VM) => (
          [vm.name, vm.os, vm.status, vm.cpu, vm.ram, vm.storage, vm.ip || 'N/A'].join(',')
        ))
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `vm-list-${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('VM List Exported', {
        description: 'Your VM list has been exported to CSV.',
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export VM list');
    }
  };

  return (
    <DashboardLayout title="VM Management" userType="admin">
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Virtual Machines</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle size={16} className="mr-2" />
                Create New VM
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <VmCreationForm onSubmit={handleCreateVM} isCreating={false} />
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative grow max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search VMs by name, OS, or IP..."
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
                <SelectItem value="creating">Creating</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" onClick={handleExportCSV}>
            <DownloadCloud size={16} className="mr-2" />
            Export CSV
          </Button>
        </div>

        {/* VM List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-8">
            <Server size={48} className="text-muted-foreground animate-pulse mb-4" />
            <p className="text-muted-foreground">Loading virtual machines...</p>
          </div>
        ) : (
          <>
            {filteredVMs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredVMs.map((vm: VM) => (
                  <VmCard 
                    key={vm.id} 
                    {...vm} 
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
                      Error loading virtual machines. Please try again.
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No virtual machines match your filters.</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default VmManagement;
