
import React from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { VmCard } from '@/components/Dashboard/VmCard';
import { ResourceUsageChart } from '@/components/Dashboard/ResourceUsageChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Server, BookOpen, FileText } from 'lucide-react';

// Sample data
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

const studentVMs = [
  {
    id: 'svm1',
    name: 'Web-Dev-Environment',
    os: 'Ubuntu 20.04 LTS',
    status: 'running' as const,
    cpu: 2,
    ram: 4,
    storage: 50,
    ip: '192.168.1.120',
  },
  {
    id: 'svm2',
    name: 'Database-Class',
    os: 'CentOS 8',
    status: 'stopped' as const,
    cpu: 4,
    ram: 8,
    storage: 100,
    ip: '192.168.1.121',
  },
];

const courseMaterials = [
  { id: 'cm1', title: 'Linux Fundamentals', description: 'Introduction to Linux commands and file system', date: '2025-03-15' },
  { id: 'cm2', title: 'Database Design', description: 'Relational database concepts and SQL', date: '2025-03-22' },
  { id: 'cm3', title: 'Web Development', description: 'HTML, CSS, and JavaScript basics', date: '2025-04-02' },
];

const assignments = [
  { id: 'asg1', title: 'Linux Server Setup', description: 'Configure a web server with Apache', dueDate: '2025-04-15', status: 'pending' },
  { id: 'asg2', title: 'Database Creation', description: 'Design and implement a database schema', dueDate: '2025-04-25', status: 'pending' },
];

const StudentPortal: React.FC = () => {
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
              <VmCard key={vm.id} {...vm} isStudent={true} />
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
                  <li key={material.id} className="p-3 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                    <h3 className="font-medium">{material.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{material.description}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Date: {material.date}
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
                  <li key={assignment.id} className="p-3 border rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{assignment.title}</h3>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                        {assignment.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{assignment.description}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      Due: {assignment.dueDate}
                    </p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentPortal;
