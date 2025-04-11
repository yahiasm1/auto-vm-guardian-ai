import React, { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResourceUsageChart } from '@/components/Dashboard/ResourceUsageChart';
import { Progress } from '@/components/ui/progress';
import { 
  Cpu, 
  MemoryStick, 
  PlusCircle, 
  MinusCircle,
  HardDrive, 
  Save
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

interface ResourcePool {
  id: string;
  name: string;
  cpuCores: number;
  ramGB: number;
  allocatedCPU: number;
  allocatedRAM: number;
}

const initialResourcePools: ResourcePool[] = [
  {
    id: 'pool1',
    name: 'Production Pool',
    cpuCores: 64,
    ramGB: 256,
    allocatedCPU: 48,
    allocatedRAM: 192,
  },
  {
    id: 'pool2',
    name: 'Development Pool',
    cpuCores: 32,
    ramGB: 128,
    allocatedCPU: 16,
    allocatedRAM: 64,
  },
  {
    id: 'pool3',
    name: 'Testing Pool',
    cpuCores: 16,
    ramGB: 64,
    allocatedCPU: 8,
    allocatedRAM: 32,
  }
];

const ResourceAllocation: React.FC = () => {
  const [resourcePools, setResourcePools] = useState<ResourcePool[]>(initialResourcePools);
  const [activePool, setActivePool] = useState<string | null>(null);
  const [cpuChange, setCpuChange] = useState<number>(0);
  const [ramChange, setRamChange] = useState<number>(0);

  const handleSaveChanges = (poolId: string) => {
    setResourcePools(pools => 
      pools.map(pool => {
        if (pool.id === poolId) {
          const newCPU = pool.allocatedCPU + cpuChange;
          const newRAM = pool.allocatedRAM + ramChange;
          
          return {
            ...pool,
            allocatedCPU: Math.min(Math.max(0, newCPU), pool.cpuCores),
            allocatedRAM: Math.min(Math.max(0, newRAM), pool.ramGB)
          };
        }
        return pool;
      })
    );
    
    setActivePool(null);
    setCpuChange(0);
    setRamChange(0);
    
    toast('Resource Allocation Updated', {
      description: 'Resource pool allocations have been updated successfully.'
    });
  };

  const handleEditPool = (poolId: string) => {
    setActivePool(poolId);
    setCpuChange(0);
    setRamChange(0);
  };

  return (
    <DashboardLayout title="Resource Allocation" userType="admin">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Resource Pool Management</h2>

        <ResourceUsageChart 
          title="System Resource Utilization (24h)" 
          data={resourceData} 
        />

        <div>
          <h3 className="text-xl font-semibold mb-4">Resource Pools</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {resourcePools.map(pool => (
              <Card key={pool.id} className="shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex justify-between items-center">
                    <span>{pool.name}</span>
                    {activePool !== pool.id ? (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditPool(pool.id)}
                      >
                        Edit
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSaveChanges(pool.id)}
                      >
                        <Save size={16} className="mr-2" /> Save
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center">
                          <Cpu size={16} className="mr-2 text-blue-500" />
                          <span>CPU Allocation</span>
                        </div>
                        <span className="font-medium">{pool.allocatedCPU} / {pool.cpuCores} cores</span>
                      </div>
                      <Progress value={(pool.allocatedCPU / pool.cpuCores) * 100} />
                      
                      {activePool === pool.id && (
                        <div className="flex items-center mt-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => setCpuChange(prev => prev - 1)}
                          >
                            <MinusCircle size={16} />
                          </Button>
                          <Input 
                            className="h-8 w-16 mx-2 text-center"
                            value={`${cpuChange >= 0 ? '+' : ''}${cpuChange}`}
                            readOnly
                          />
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => setCpuChange(prev => prev + 1)}
                          >
                            <PlusCircle size={16} />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center">
                          <MemoryStick size={16} className="mr-2 text-green-500" />
                          <span>RAM Allocation</span>
                        </div>
                        <span className="font-medium">{pool.allocatedRAM} / {pool.ramGB} GB</span>
                      </div>
                      <Progress value={(pool.allocatedRAM / pool.ramGB) * 100} />
                      
                      {activePool === pool.id && (
                        <div className="flex items-center mt-2">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => setRamChange(prev => prev - 4)}
                          >
                            <MinusCircle size={16} />
                          </Button>
                          <Input 
                            className="h-8 w-16 mx-2 text-center"
                            value={`${ramChange >= 0 ? '+' : ''}${ramChange}`}
                            readOnly
                          />
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => setRamChange(prev => prev + 4)}
                          >
                            <PlusCircle size={16} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Detailed Resource Allocation</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pool Name</TableHead>
                    <TableHead>Total CPU</TableHead>
                    <TableHead>Used CPU</TableHead>
                    <TableHead>Total RAM</TableHead>
                    <TableHead>Used RAM</TableHead>
                    <TableHead>Utilization</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resourcePools.map(pool => {
                    const cpuUtilization = (pool.allocatedCPU / pool.cpuCores) * 100;
                    const ramUtilization = (pool.allocatedRAM / pool.ramGB) * 100;
                    const overallUtilization = (cpuUtilization + ramUtilization) / 2;
                    
                    return (
                      <TableRow key={pool.id}>
                        <TableCell>{pool.name}</TableCell>
                        <TableCell>{pool.cpuCores} cores</TableCell>
                        <TableCell>{pool.allocatedCPU} cores</TableCell>
                        <TableCell>{pool.ramGB} GB</TableCell>
                        <TableCell>{pool.allocatedRAM} GB</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Progress 
                              value={overallUtilization} 
                              className="h-2 w-32 mr-2" 
                            />
                            <span>{Math.round(overallUtilization)}%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResourceAllocation;
