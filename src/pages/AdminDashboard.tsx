
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { StatusOverview } from '@/components/Dashboard/StatusOverview';
import { ResourceUsageChart } from '@/components/Dashboard/ResourceUsageChart';
import { VmCard } from '@/components/Dashboard/VmCard';
import { AiPredictionCard } from '@/components/Dashboard/AiPredictionCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { VmCreationForm } from '@/components/Forms/VmCreationForm';
import { Server, Cpu, HardDrive, Wifi, Users, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Sample data
const statusItems = [
  {
    id: 'vms',
    name: 'Active VMs',
    value: 45,
    icon: <Server size={20} className="text-vmSystem-blue" />,
    change: { value: 12, isPositive: true },
  },
  {
    id: 'cpu',
    name: 'CPU Usage',
    value: '68%',
    icon: <Cpu size={20} className="text-vmSystem-teal" />,
    status: 'warning',
  },
  {
    id: 'storage',
    name: 'Storage',
    value: '4.2TB',
    icon: <HardDrive size={20} className="text-purple-500" />,
    change: { value: 5, isPositive: true },
  },
  {
    id: 'network',
    name: 'Network',
    value: '1.8Gbps',
    icon: <Wifi size={20} className="text-orange-500" />,
    status: 'normal',
  },
  {
    id: 'users',
    name: 'Active Users',
    value: 132,
    icon: <Users size={20} className="text-indigo-500" />,
    change: { value: 8, isPositive: true },
  },
];

const resourceData = [
  { name: '00:00', cpu: 15, ram: 30, storage: 45 },
  { name: '03:00', cpu: 20, ram: 32, storage: 45 },
  { name: '06:00', cpu: 25, ram: 38, storage: 46 },
  { name: '09:00', cpu: 45, ram: 43, storage: 46 },
  { name: '12:00', cpu: 50, ram: 45, storage: 47 },
  { name: '15:00', cpu: 65, ram: 50, storage: 48 },
  { name: '18:00', cpu: 75, ram: 60, storage: 48 },
  { name: '21:00', cpu: 68, ram: 55, storage: 49 },
  { name: 'Now', cpu: 60, ram: 50, storage: 50 },
];

const vmSampleData = [
  {
    id: 'vm1',
    name: 'Ubuntu-Web-Server',
    os: 'Ubuntu 20.04 LTS',
    status: 'running' as const,
    cpu: 4,
    ram: 8,
    storage: 100,
    ip: '192.168.1.101',
  },
  {
    id: 'vm2',
    name: 'Win10-Dev',
    os: 'Windows 10 Pro',
    status: 'running' as const,
    cpu: 8,
    ram: 16,
    storage: 250,
    ip: '192.168.1.102',
  },
  {
    id: 'vm3',
    name: 'DB-Server',
    os: 'CentOS 8',
    status: 'stopped' as const,
    cpu: 8,
    ram: 32,
    storage: 500,
    ip: '192.168.1.103',
  },
  {
    id: 'vm4',
    name: 'Test-Environment',
    os: 'Debian 11',
    status: 'suspended' as const,
    cpu: 2,
    ram: 4,
    storage: 50,
    ip: '192.168.1.104',
  },
];

const predictionData = [
  { time: 'Now', actual: 60, predicted: 60 },
  { time: '+1h', actual: 0, predicted: 65 },
  { time: '+2h', actual: 0, predicted: 72 },
  { time: '+3h', actual: 0, predicted: 80 },
  { time: '+4h', actual: 0, predicted: 85 },
  { time: '+5h', actual: 0, predicted: 78 },
  { time: '+6h', actual: 0, predicted: 65 },
];

const AdminDashboard: React.FC = () => {
  const [creatingVM, setCreatingVM] = useState(false);
  const [vms, setVMs] = useState(vmSampleData);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleCreateVM = (data: any) => {
    setCreatingVM(true);
    
    // Simulate API call
    setTimeout(() => {
      const newVM = {
        id: `vm${vms.length + 1}`,
        name: data.name,
        os: data.os,
        status: 'creating' as const,
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
              ? { ...vm, status: 'running' as const, ip: '192.168.1.105' } 
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

  return (
    <DashboardLayout title="Admin Dashboard" userType="admin">
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">System Overview</h2>
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

        {/* Status Cards */}
        <StatusOverview items={statusItems} title="System Status" />

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResourceUsageChart 
            title="Resource Utilization (24h)" 
            data={resourceData} 
          />
          <AiPredictionCard
            title="AI Predicted CPU Usage (Next 6h)"
            data={predictionData}
            resourceType="CPU"
            predictionConfidence={85}
            alertThreshold={80}
          />
        </div>

        {/* Virtual Machines */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Virtual Machines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {vms.map((vm) => (
              <VmCard key={vm.id} {...vm} />
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
