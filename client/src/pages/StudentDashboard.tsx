
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MyVMRequests } from "@/components/VM/MyVMRequests";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RequestVMForm } from "@/components/VM/RequestVMForm";
import { useNavigate } from "react-router-dom";
import { vmService, VM } from "@/services/vmService";
import { toast } from "sonner";
import {
  FiMonitor,
  FiPower,
  FiCpu,
  FiHardDrive,
  FiRotateCw,
  FiPlus,
  FiAlertCircle,
  FiLoader,
} from "react-icons/fi";
import { FaMemory } from "react-icons/fa";
import { Progress } from "@/components/ui/progress";

const StudentDashboard: React.FC = () => {
  const [requestFormOpen, setRequestFormOpen] = useState(false);
  const navigate = useNavigate();
  
  // Fetch real VMs from the API
  const { 
    data: myVms = [], 
    isLoading: vmsLoading, 
    error: vmsError,
    refetch: refetchVMs
  } = useQuery({
    queryKey: ["myVMs"],
    queryFn: () => vmService.listMyVMs(),
  });

  const handleStartVm = async (vmName: string) => {
    try {
      toast.loading(`Starting VM: ${vmName}...`);
      await vmService.startVM(vmName);
      toast.success(`VM ${vmName} started successfully`);
      refetchVMs();
    } catch (error) {
      console.error(`Error starting VM:`, error);
      toast.error(`Failed to start VM: ${vmName}`);
    }
  };

  const handleStopVm = async (vmName: string) => {
    try {
      toast.loading(`Stopping VM: ${vmName}...`);
      await vmService.stopVM(vmName);
      toast.success(`VM ${vmName} stopped successfully`);
      refetchVMs();
    } catch (error) {
      console.error(`Error stopping VM:`, error);
      toast.error(`Failed to stop VM: ${vmName}`);
    }
  };

  const handleRestartVm = async (vmName: string) => {
    try {
      toast.loading(`Restarting VM: ${vmName}...`);
      await vmService.restartVM(vmName);
      toast.success(`VM ${vmName} is restarting`);
      refetchVMs();
    } catch (error) {
      console.error(`Error restarting VM:`, error);
      toast.error(`Failed to restart VM: ${vmName}`);
    }
  };

  const handleRequestSubmitted = () => {
    setRequestFormOpen(false);
    navigate("/student/requests");
  };

  return (
    <DashboardLayout title="Student Dashboard" userType="student">
      <div className="flex flex-col space-y-8">
        {/* VM Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">My Virtual Machines</h2>
            
            <Button 
              onClick={() => setRequestFormOpen(true)}
              className="flex items-center gap-2"
            >
              <FiPlus size={16} /> Request VM
            </Button>
          </div>
          
          {vmsLoading ? (
            <div className="flex justify-center items-center py-12">
              <FiLoader className="animate-spin mr-2" size={20} />
              <p>Loading your virtual machines...</p>
            </div>
          ) : vmsError ? (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="flex items-center justify-between py-6">
                <div className="flex items-center">
                  <FiAlertCircle className="text-red-500 mr-2" size={20} />
                  <p>Error loading your virtual machines. Please try again later.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetchVMs()}>
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : myVms.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <FiMonitor className="text-slate-400 mb-2" size={40} />
                <h3 className="text-lg font-medium mb-1">No Virtual Machines</h3>
                <p className="text-slate-500 mb-4">You don't have any virtual machines yet.</p>
                <Button onClick={() => setRequestFormOpen(true)}>
                  Request a VM
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myVms.map((vm) => (
                <Card key={vm.id || vm.name} className="overflow-hidden border">
                  <CardHeader className="bg-slate-50 dark:bg-slate-800 border-b">
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>{vm.name}</span>
                      <span
                        className={`text-sm px-2 py-1 rounded-full ${
                          vm.status === "running"
                            ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                            : vm.status === "error"
                            ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {vm.status?.charAt(0).toUpperCase() + vm.status?.slice(1) || "Unknown"}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                      <div className="flex items-center">
                        <FiMonitor size={16} className="mr-2 text-slate-500" />
                        {vm.os_type || "Unknown OS"}
                      </div>
                      <div className="flex items-center">
                        <FiCpu size={16} className="mr-2 text-slate-500" /> 
                        {vm.vcpus || "?"} vCPUs
                      </div>
                      <div className="flex items-center">
                        <FaMemory size={16} className="mr-2 text-slate-500" />
                        {vm.memory ? `${vm.memory} MB` : "?"} RAM
                      </div>
                      <div className="flex items-center">
                        <FiHardDrive size={16} className="mr-2 text-slate-500" />
                        {vm.storage || "?"} GB
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600 dark:text-slate-400">
                          VM Allocation
                        </span>
                        <span className="text-slate-600 dark:text-slate-400">
                          Ready
                        </span>
                      </div>
                      <Progress value={100} className="h-1.5" />
                    </div>

                    <div className="flex justify-between mt-4">
                      {vm.status === "running" ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleStopVm(vm.name)}
                          >
                            <FiPower size={16} className="mr-2" /> Stop
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRestartVm(vm.name)}
                          >
                            <FiRotateCw size={16} className="mr-2" /> Restart
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-green-600 border-green-200 hover:bg-green-50"
                          onClick={() => handleStartVm(vm.name)}
                        >
                          <FiPower size={16} className="mr-2" /> Start
                        </Button>
                      )}
                      <Button variant="default" size="sm">
                        Connect
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* VM Requests Section */}
        <div>
          <MyVMRequests onRefreshRequested={() => refetchVMs()} />
        </div>

        <Dialog open={requestFormOpen} onOpenChange={setRequestFormOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Request a Virtual Machine</DialogTitle>
            </DialogHeader>
            <RequestVMForm onRequestSubmitted={handleRequestSubmitted} />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
