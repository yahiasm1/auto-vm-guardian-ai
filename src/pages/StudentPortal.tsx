
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { VmCard, VMStatus } from '@/components/Dashboard/VmCard';
import { ResourceUsageChart } from '@/components/Dashboard/ResourceUsageChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Server, BookOpen, FileText, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Resource usage data
const resourceData = [
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

// Student VM data
interface StudentVM {
  id: string;
  name: string;
  os: string;
  status: VMStatus;
  cpu: number;
  ram: number;
  storage: number;
  ip?: string;
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
  },
];

// Course materials data
interface CourseMaterial {
  id: string;
  title: string;
  description: string;
  date: string;
}

const courseMaterials: CourseMaterial[] = [
  { id: 'cm1', title: 'Linux Fundamentals', description: 'Introduction to Linux commands and file system', date: '2025-03-15' },
  { id: 'cm2', title: 'Database Design', description: 'Relational database concepts and SQL', date: '2025-03-22' },
  { id: 'cm3', title: 'Web Development', description: 'HTML, CSS, and JavaScript basics', date: '2025-04-02' },
];

// Assignment data
interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
}

const assignments: Assignment[] = [
  { id: 'asg1', title: 'Linux Server Setup', description: 'Configure a web server with Apache', dueDate: '2025-04-15', status: 'pending' },
  { id: 'asg2', title: 'Database Creation', description: 'Design and implement a database schema', dueDate: '2025-04-25', status: 'pending' },
];

const StudentPortal: React.FC = () => {
  const [studentVMs, setStudentVMs] = useState<StudentVM[]>(initialStudentVMs);
  const [selectedVM, setSelectedVM] = useState<string | null>(null);
  const [showConsole, setShowConsole] = useState<boolean>(false);
  
  const handleMaterialClick = (material: CourseMaterial) => {
    toast(`Opening material: ${material.title}`);
    // In a real app, this would open the material in a new page or modal
  };
  
  const handleAssignmentClick = (assignment: Assignment) => {
    toast(`Opening assignment: ${assignment.title}`);
    // In a real app, this would open the assignment in a new page or modal
  };

  const openConsole = (vmId: string) => {
    setSelectedVM(vmId);
    setShowConsole(true);
  };

  return (
    <DashboardLayout title="Student Portal" userType="student">
      <div className="space-y-6">
        {/* Welcome Message */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h2 className="text-2xl font-bold mb-2">Welcome, Student</h2>
          <p className="text-slate-600 dark:text-slate-300">
            Manage your virtual machines and access course materials.
          </p>
        </div>

        {/* My Virtual Machines */}
        <div>
          <h2 className="text-xl font-semibold mb-4">My Virtual Machines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {studentVMs.map((vm) => (
              <VmCard 
                key={vm.id} 
                {...vm} 
                isStudent={true} 
                onConnect={openConsole}
              />
            ))}
          </div>
        </div>

        {/* Resource Usage */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ResourceUsageChart 
            title="My Resource Usage (24h)" 
            data={resourceData} 
          />

          {/* VM Quota Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <Server size={18} />
                Resource Allocation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU Usage</span>
                    <span>2 / 4 vCPUs</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-vmSystem-blue w-1/2" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Memory Usage</span>
                    <span>4 GB / 8 GB</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-1/2" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Storage Usage</span>
                    <span>42 GB / 150 GB</span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 w-[28%]" />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-3 bg-slate-50 dark:bg-slate-700 rounded-md">
                <h4 className="font-medium text-sm mb-1">Need more resources?</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Contact your instructor if you need additional VM resources for your coursework.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Course Materials & Assignments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Course Materials */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <BookOpen size={18} />
                Course Materials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {courseMaterials.map((material) => (
                  <li 
                    key={material.id} 
                    className="p-3 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                    onClick={() => handleMaterialClick(material)}
                  >
                    <h3 className="font-medium">{material.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{material.description}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center">
                      <Clock size={12} className="mr-1" /> {material.date}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Assignments */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <FileText size={18} />
                Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {assignments.map((assignment) => (
                  <li 
                    key={assignment.id} 
                    className="p-3 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                    onClick={() => handleAssignmentClick(assignment)}
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium">{assignment.title}</h3>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                        {assignment.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{assignment.description}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 flex items-center">
                      <Clock size={12} className="mr-1" /> Due: {assignment.dueDate}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Web Console Modal */}
      <Sheet open={showConsole} onOpenChange={setShowConsole}>
        <SheetContent side="right" className="w-[90%] sm:w-[540px] md:w-[720px] p-0">
          <SheetHeader className="p-6 border-b">
            <SheetTitle>
              {selectedVM && studentVMs.find(vm => vm.id === selectedVM)?.name} - Web Console
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
                    <p>{studentVMs.find(vm => vm.id === selectedVM)?.name}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm text-slate-500">Operating System</h3>
                    <p>{studentVMs.find(vm => vm.id === selectedVM)?.os}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm text-slate-500">IP Address</h3>
                    <p>{studentVMs.find(vm => vm.id === selectedVM)?.ip || 'Not assigned'}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm text-slate-500">VM Status</h3>
                    <p>{studentVMs.find(vm => vm.id === selectedVM)?.status}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm text-slate-500">Connection Methods</h3>
                    <div className="mt-2 space-y-2">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded border">
                        <h4 className="font-medium">SSH Command</h4>
                        <code className="block bg-slate-100 dark:bg-slate-700 p-2 rounded mt-1 text-xs">
                          ssh student@{studentVMs.find(vm => vm.id === selectedVM)?.ip || 'vm-ip-address'}
                        </code>
                      </div>
                      
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded border">
                        <h4 className="font-medium">RDP Information (for Windows VMs)</h4>
                        <p className="text-sm mt-1">Server: {studentVMs.find(vm => vm.id === selectedVM)?.ip || 'vm-ip-address'}</p>
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

export default StudentPortal;
