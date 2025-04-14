
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { StatusOverview } from "@/components/Dashboard/StatusOverview";
import { VmCard } from "@/components/Dashboard/VmCard";
import { ResourceUsageChart } from "@/components/Dashboard/ResourceUsageChart";
import { AiPredictionCard } from "@/components/Dashboard/AiPredictionCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  // Mock data for demonstration 
  const vmData = [
    { id: 'vm1', name: 'Ubuntu Server', status: 'running', os: 'Ubuntu 22.04', cpu: 2, ram: 4, storage: 50, assignedTo: 'CS101 Group' },
    { id: 'vm2', name: 'Windows Lab', status: 'stopped', os: 'Windows 11', cpu: 4, ram: 8, storage: 120, assignedTo: 'Software Eng Class' },
    { id: 'vm3', name: 'Data Science VM', status: 'creating', os: 'Ubuntu 20.04', cpu: 8, ram: 16, storage: 250, assignedTo: 'Data Science 202' }
  ];

  const resourceStats = {
    cpu: { used: 65, total: 100 },
    ram: { used: 48, total: 64 },
    storage: { used: 1.2, total: 2 }
  };

  return (
    <DashboardLayout title="Admin Dashboard" userType="admin">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2">
          <StatusOverview 
            stats={{
              totalVms: 24,
              runningVms: 18,
              storageUsed: 1.2,
              activeUsers: 145
            }}
          />

          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                Recent Virtual Machines
              </h2>
              <Link to="/admin/vms">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  View All <FiArrowRight size={16} />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vmData.map(vm => (
                <VmCard key={vm.id} vm={vm} />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Resource Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <ResourceUsageChart 
                cpuUsage={resourceStats.cpu.used} 
                ramUsage={resourceStats.ram.used} 
                storageUsage={(resourceStats.storage.used / resourceStats.storage.total) * 100} 
              />
            </CardContent>
          </Card>

          <AiPredictionCard 
            predictions={[
              { title: "Potential Storage Shortage", description: "Storage projected to reach 90% capacity in 14 days", severity: "warning" },
              { title: "VM Performance Issue", description: "CS101 Lab VM showing degraded performance", severity: "alert" }
            ]} 
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
