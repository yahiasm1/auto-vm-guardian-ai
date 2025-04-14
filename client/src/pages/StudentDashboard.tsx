import React from "react";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FiMonitor,
  FiPower,
  FiCpu,
  FiHardDrive,
  FiRotateCw,
} from "react-icons/fi";
import { FaMemory } from "react-icons/fa";
import { Progress } from "@/components/ui/progress";

const StudentDashboard = () => {
  // Mock data for virtual machines assigned to student
  const myVms = [
    {
      id: "vm1",
      name: "CS101-Lab-VM",
      status: "running",
      os: "Ubuntu 22.04",
      cpu: 2,
      ram: 4,
      storage: 50,
      course: "CS101",
    },
    {
      id: "vm2",
      name: "DataScience-VM",
      status: "stopped",
      os: "Ubuntu 20.04",
      cpu: 4,
      ram: 8,
      storage: 100,
      course: "DS202",
    },
  ];

  const handleStartVm = (vmId: string) => {
    console.log(`Starting VM: ${vmId}`);
    // API call to start VM would go here
  };

  const handleStopVm = (vmId: string) => {
    console.log(`Stopping VM: ${vmId}`);
    // API call to stop VM would go here
  };

  const handleRestartVm = (vmId: string) => {
    console.log(`Restarting VM: ${vmId}`);
    // API call to restart VM would go here
  };

  return (
    <DashboardLayout title="Student Dashboard" userType="student">
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">My Virtual Machines</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {myVms.map((vm) => (
            <Card key={vm.id} className="overflow-hidden border">
              <CardHeader className="bg-slate-50 dark:bg-slate-800 border-b">
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>{vm.name}</span>
                  <span
                    className={`text-sm px-2 py-1 rounded-full ${
                      vm.status === "running"
                        ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {vm.status.charAt(0).toUpperCase() + vm.status.slice(1)}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                  <div className="flex items-center">
                    <FiMonitor size={16} className="mr-2 text-slate-500" />{" "}
                    {vm.os}
                  </div>
                  <div className="flex items-center">
                    <FiCpu size={16} className="mr-2 text-slate-500" /> {vm.cpu}{" "}
                    CPU cores
                  </div>
                  <div className="flex items-center">
                    <FaMemory size={16} className="mr-2 text-slate-500" />{" "}
                    {vm.ram} GB RAM
                  </div>
                  <div className="flex items-center">
                    <FiHardDrive size={16} className="mr-2 text-slate-500" />{" "}
                    {vm.storage} GB
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 dark:text-slate-400">
                      Disk Usage
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      45%
                    </span>
                  </div>
                  <Progress value={45} className="h-1.5" />
                </div>

                <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  Course: {vm.course}
                </div>

                <div className="flex justify-between mt-4">
                  {vm.status === "running" ? (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleStopVm(vm.id)}
                      >
                        <FiPower size={16} className="mr-2" /> Stop
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestartVm(vm.id)}
                      >
                        <FiRotateCw size={16} className="mr-2" /> Restart
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-200 hover:bg-green-50"
                      onClick={() => handleStartVm(vm.id)}
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
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
