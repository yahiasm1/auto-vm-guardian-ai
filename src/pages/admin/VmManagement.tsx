
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { VmCard, VMStatus } from '@/components/Dashboard/VmCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { VmCreationForm } from '@/components/Forms/VmCreationForm';
import { PlusCircle, Search, Filter, DownloadCloud } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

interface VM {
  id: string;
  name: string;
  os: string;
  status: VMStatus;
  cpu: number;
  ram: number;
  storage: number;
  ip?: string;
}

const vmSampleData: VM[] = [
  {
    id: 'vm1',
    name: 'Ubuntu-Web-Server',
    os: 'Ubuntu 20.04 LTS',
    status: 'running',
    cpu: 4,
    ram: 8,
    storage: 100,
    ip: '192.168.1.101',
  },
  {
    id: 'vm2',
    name: 'Win10-Dev',
    os: 'Windows 10 Pro',
    status: 'running',
    cpu: 8,
    ram: 16,
    storage: 250,
    ip: '192.168.1.102',
  },
  {
    id: 'vm3',
    name: 'DB-Server',
    os: 'CentOS 8',
    status: 'stopped',
    cpu: 8,
    ram: 32,
    storage: 500,
    ip: '192.168.1.103',
  },
  {
    id: 'vm4',
    name: 'Test-Environment',
    os: 'Debian 11',
    status: 'suspended',
    cpu: 2,
    ram: 4,
    storage: 50,
    ip: '192.168.1.104',
  },
  {
    id: 'vm5',
    name: 'Analytics-Server',
    os: 'Ubuntu 22.04 LTS',
    status: 'running',
    cpu: 16,
    ram: 64,
    storage: 1000,
    ip: '192.168.1.105',
  },
  {
    id: 'vm6',
    name: 'Frontend-Dev',
    os: 'Windows 11 Pro',
    status: 'stopped',
    cpu: 4,
    ram: 16,
    storage: 250,
    ip: '192.168.1.106',
  },
];

const VmManagement: React.FC = () => {
  const [vms, setVMs] = useState<VM[]>(vmSampleData);
  const [creatingVM, setCreatingVM] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredVMs = vms.filter(vm => {
    const matchesSearch = vm.name.toLowerCase().includes(search.toLowerCase()) ||
                        vm.os.toLowerCase().includes(search.toLowerCase()) ||
                        vm.ip?.includes(search);
    
    const matchesStatus = statusFilter === 'all' || vm.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateVM = (data: any) => {
    setCreatingVM(true);
    
    // Simulate API call
    setTimeout(() => {
      const newVM: VM = {
        id: `vm${vms.length + 1}`,
        name: data.name,
        os: data.os,
        status: 'creating',
        cpu: data.cpuCores,
        ram: data.ramGB,
        storage: data.storageGB,
      };
      
      setVMs([...vms, newVM]);
      setCreatingVM(false);
      setDialogOpen(false);
      
      toast({
        title: 'VM Creation Started',
        description: `${data.name} is being created. This may take a few minutes.`,
      });
      
      // Simulate VM creation completion
      setTimeout(() => {
        setVMs(prevVMs => 
          prevVMs.map(vm => 
            vm.id === newVM.id 
              ? { ...vm, status: 'running' as VMStatus, ip: '192.168.1.107' } 
              : vm
          )
        );
        
        toast({
          title: 'VM Created Successfully',
          description: `${data.name} is now running and ready to use.`,
        });
      }, 5000);
    }, 2000);
  };

  const handleExportCSV = () => {
    toast('Exporting VM list to CSV...');
    // In a real app, this would generate and download a CSV file
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
              <VmCreationForm onSubmit={handleCreateVM} isCreating={creatingVM} />
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredVMs.map((vm) => (
            <VmCard key={vm.id} {...vm} />
          ))}

          {filteredVMs.length === 0 && (
            <div className="col-span-full p-8 text-center border rounded-lg">
              <p className="text-muted-foreground">No virtual machines match your filters.</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VmManagement;
