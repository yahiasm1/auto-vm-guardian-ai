
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { StatusOverview } from "@/components/Dashboard/StatusOverview";
import { VmCard } from "@/components/Dashboard/VmCard";
import { ResourceUsageChart } from "@/components/Dashboard/ResourceUsageChart";
import { AiPredictionCard } from "@/components/Dashboard/AiPredictionCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { vmService } from "@/services/vmService";
import { FiArrowRight } from "react-icons/fi";

const AdminDashboard: React.FC = () => {
  const { 
    data: dashboardData, 
    isLoading: isLoadingDashboard, 
    error: dashboardError 
  } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: vmService.getDashboardData,
    retry: 2,
  });

  const { 
    data: recentRequests, 
    isLoading: isLoadingRequests, 
    error: requestsError 
  } = useQuery({
    queryKey: ["recent-vm-requests"],
    queryFn: vmService.getRecentVMRequests,
    retry: 2,
  });

  if (dashboardError) {
    toast.error("Failed to load dashboard data");
  }

  if (requestsError) {
    toast.error("Failed to load recent requests");
  }

  // Default data to show until real data loads
  const stats = dashboardData?.stats || {
    totalVms: 0,
    runningVms: 0,
    storageUsed: 0,
    activeUsers: 0
  };

  const recentVms = dashboardData?.recentVms || [];
  
  const resourceStats = dashboardData?.resourceStats || {
    cpu: { used: 0, total: 100 },
    ram: { used: 0, total: 64 },
    storage: { used: 0, total: 2 }
  };

  return (
    <DashboardLayout title="Admin Dashboard" userType="admin">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="col-span-1 lg:col-span-2">
          <StatusOverview 
            stats={stats}
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

            {isLoadingDashboard ? (
              <div className="text-center py-8">Loading recent VMs...</div>
            ) : recentVms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentVms.map(vm => (
                  <VmCard key={vm.id || vm.name} vm={vm} />
                ))}
              </div>
            ) : (
              <Card className="py-6">
                <CardContent>
                  <p className="text-center text-muted-foreground">No virtual machines found</p>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
                Recent VM Requests
              </h2>
              <Link to="/admin/vm-requests">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  View All <FiArrowRight size={16} />
                </Button>
              </Link>
            </div>
            
            {isLoadingRequests ? (
              <div className="text-center py-8">Loading recent requests...</div>
            ) : recentRequests && recentRequests.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-3">User</th>
                        <th className="text-left p-3">Purpose</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentRequests.map((request) => (
                        <tr key={request.id} className="border-b hover:bg-muted/50">
                          <td className="p-3">{request.username || "Unknown"}</td>
                          <td className="p-3">{request.purpose}</td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              request.status === 'pending' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : request.status === 'approved' 
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                            </span>
                          </td>
                          <td className="p-3">
                            {new Date(request.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            ) : (
              <Card className="py-6">
                <CardContent>
                  <p className="text-center text-muted-foreground">No VM requests found</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Resource Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <ResourceUsageChart 
                cpuUsage={(resourceStats.cpu.used / resourceStats.cpu.total) * 100} 
                ramUsage={(resourceStats.ram.used / resourceStats.ram.total) * 100} 
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
