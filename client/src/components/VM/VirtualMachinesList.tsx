
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { VmCard } from "@/components/Dashboard/VmCard";
import { Button } from "@/components/ui/button";
import { FiPlus, FiServer } from "react-icons/fi";
import vmService, { VM } from "@/services/vmService";
import { AddVMModal } from "./AddVMModal";
import { toast } from "sonner";

export const VirtualMachinesList: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const { data: vms, isLoading, error, refetch } = useQuery({
    queryKey: ['vms'],
    queryFn: () => vmService.listVMs(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700">
        <h3 className="font-medium">Error loading VMs</h3>
        <p className="text-sm mt-1">{(error as Error).message}</p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2" 
          onClick={() => refetch()}
        >
          Retry
        </Button>
      </div>
    );
  }

  const handleVMAdded = () => {
    refetch();
    toast.success("VM added successfully");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Virtual Machines</h2>
        <Button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2">
          <FiPlus size={16} /> Add VM
        </Button>
      </div>

      {vms && vms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vms.map((vm: VM) => (
            <VmCard
              key={vm.id || vm.name}
              vm={{
                id: vm.id || vm.name,
                name: vm.name,
                status: vm.status || "error",
                os: vm.os_type || "Linux",
                cpu: vm.vcpus || 1,
                ram: (vm.memory ? vm.memory / 1024 : 1),
                storage: parseInt(vm.storage || "10"),
                assignedTo: vm.user_id ? "User" : undefined,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <FiServer size={40} className="mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No VMs found</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Get started by creating a new virtual machine.
          </p>
          <Button onClick={() => setIsAddModalOpen(true)} className="mt-4">
            <FiPlus className="mr-2" /> Add VM
          </Button>
        </div>
      )}

      <AddVMModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onVMAdded={handleVMAdded}
      />
    </div>
  );
};

