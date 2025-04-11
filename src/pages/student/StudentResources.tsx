
import React from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { ResourceUsageChart } from '@/components/Dashboard/ResourceUsageChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Cpu, MemoryStick, HardDrive } from 'lucide-react';

// Resource usage data over time
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

const StudentResources: React.FC = () => {
  return (
    <DashboardLayout title="Resource Usage" userType="student">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">My Resource Usage</h2>
        <p className="text-slate-600 dark:text-slate-300">
          Monitor your virtual machine resource consumption and allocated quota.
        </p>
        
        {/* Resource Usage Chart */}
        <ResourceUsageChart 
          title="Resource Utilization (24h)" 
          data={resourceData} 
        />
        
        {/* Current Resource Allocation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CPU Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Cpu className="mr-2 h-5 w-5 text-blue-500" />
                CPU Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Current Usage</span>
                  <span className="font-medium">30%</span>
                </div>
                <Progress value={30} className="h-2" />
                
                <div className="flex justify-between text-sm">
                  <span>Allocated</span>
                  <span className="font-medium">2 / 4 vCPUs</span>
                </div>
                <Progress value={50} className="h-2" />
                
                <div className="mt-4 bg-slate-50 dark:bg-slate-800 p-3 rounded-md text-xs">
                  <p>Peak usage: 65% at 18:00</p>
                  <p>Average usage: 32%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* RAM Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <MemoryStick className="mr-2 h-5 w-5 text-green-500" />
                Memory Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Current Usage</span>
                  <span className="font-medium">35%</span>
                </div>
                <Progress value={35} className="h-2" />
                
                <div className="flex justify-between text-sm">
                  <span>Allocated</span>
                  <span className="font-medium">4 GB / 8 GB</span>
                </div>
                <Progress value={50} className="h-2" />
                
                <div className="mt-4 bg-slate-50 dark:bg-slate-800 p-3 rounded-md text-xs">
                  <p>Peak usage: 50% at 18:00</p>
                  <p>Average usage: 37%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Storage Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <HardDrive className="mr-2 h-5 w-5 text-purple-500" />
                Storage Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Current Usage</span>
                  <span className="font-medium">42%</span>
                </div>
                <Progress value={42} className="h-2" />
                
                <div className="flex justify-between text-sm">
                  <span>Allocated</span>
                  <span className="font-medium">42 GB / 150 GB</span>
                </div>
                <Progress value={28} className="h-2" />
                
                <div className="mt-4 bg-slate-50 dark:bg-slate-800 p-3 rounded-md text-xs">
                  <p>Steady increase: +2 GB this week</p>
                  <p>Available: 108 GB</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Resource Request Section */}
        <Card>
          <CardHeader>
            <CardTitle>Request Additional Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-slate-600 dark:text-slate-300">
              If you need additional resources for your course projects, you can request them below.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-md">
                <h4 className="font-medium mb-2">CPU Upgrade</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Request additional vCPU cores for compute-intensive tasks.
                </p>
                <button className="bg-vmSystem-blue hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
                  Request vCPUs
                </button>
              </div>
              
              <div className="p-4 border rounded-md">
                <h4 className="font-medium mb-2">Memory Upgrade</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Request additional RAM for memory-intensive applications.
                </p>
                <button className="bg-vmSystem-blue hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
                  Request RAM
                </button>
              </div>
              
              <div className="p-4 border rounded-md">
                <h4 className="font-medium mb-2">Storage Upgrade</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Request additional storage space for your VMs.
                </p>
                <button className="bg-vmSystem-blue hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm">
                  Request Storage
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default StudentResources;
