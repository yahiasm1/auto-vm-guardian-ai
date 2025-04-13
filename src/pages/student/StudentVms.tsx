
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { VmCard, VMStatus } from '@/components/Dashboard/VmCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
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
}

const initialStudentVMs: StudentVM[] = [
  {
    id: 'svm1',
    name: 'Web-Dev-Environment',
    os: 'Ubuntu 20.04 LTS',
    status: 'running',
    cpu: 2,
    ram: 4,
    storage: 50,
    ip: '192.168.1.120',
    course: 'Web Development',
  },
  {
    id: 'svm2',
    name: 'Database-Class',
    os: 'CentOS 8',
    status: 'stopped',
    cpu: 4,
    ram: 8,
    storage: 100,
    ip: '192.168.1.121',
    course: 'Database Systems',
  },
  {
    id: 'svm3',
    name: 'AI-Lab-VM',
    os: 'Ubuntu 22.04 LTS',
    status: 'running',
    cpu: 8,
    ram: 16,
    storage: 200,
    ip: '192.168.1.122',
    course: 'Artificial Intelligence',
  },
  {
    id: 'svm4',
    name: 'Network-Security',
    os: 'Kali Linux',
    status: 'suspended',
    cpu: 4,
    ram: 8,
    storage: 80,
    ip: '192.168.1.123',
    course: 'Network Security',
  },
];

const StudentVms: React.FC = () => {
  const [studentVMs, setStudentVMs] = useState<StudentVM[]>(initialStudentVMs);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredVMs = studentVMs.filter(vm => {
    const matchesSearch = vm.name.toLowerCase().includes(search.toLowerCase()) ||
                        vm.os.toLowerCase().includes(search.toLowerCase()) ||
                        vm.course?.toLowerCase().includes(search.toLowerCase()) ||
                        vm.ip?.includes(search);
    
    const matchesStatus = statusFilter === 'all' || vm.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredVMs.map((vm) => (
            <VmCard key={vm.id} {...vm} isStudent={true} />
          ))}

          {filteredVMs.length === 0 && (
            <div className="col-span-full p-8 text-center border rounded-lg">
              <p className="text-muted-foreground">No virtual machines match your filters.</p>
            </div>
          )}
        </div>

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
