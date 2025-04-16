import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { vmService, VM } from "@/services/vmService";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FiMoreVertical, FiCpu, FiHardDrive } from "react-icons/fi";
import { FaMemory } from "react-icons/fa";

export function VirtualMachinesList() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // Use different endpoints based on user role
  const {
    data: vms,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["vms", isAdmin ? "all" : "my"],
    queryFn: () => (isAdmin ? vmService.listVMs() : vmService.listMyVMs()),
  });

  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [selectedVM, setSelectedVM] = useState<VM | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleVMAction = async (
    vmName: string,
    action: "start" | "stop" | "restart" | "suspend" | "resume"
  ) => {
    setIsActionInProgress(true);
    try {
      let result;
      switch (action) {
        case "start":
          result = await vmService.startVM(vmName);
          break;
        case "stop":
          result = await vmService.stopVM(vmName);
          break;
        case "restart":
          result = await vmService.restartVM(vmName);
          break;
        case "suspend":
          result = await vmService.suspendVM(vmName);
          break;
        case "resume":
          result = await vmService.resumeVM(vmName);
          break;
      }

      if (result.success) {
        toast.success(result.message || `VM ${action} operation successful`);
        refetch();
      } else {
        toast.error(result.message || `Failed to ${action} VM`);
      }
    } catch (error) {
      console.error(`Error during ${action} operation:`, error);
      toast.error(`Failed to ${action} VM: ${(error as Error).message}`);
    } finally {
      setIsActionInProgress(false);
    }
  };

  const handleDeleteVM = async () => {
    if (!selectedVM) return;

    setIsActionInProgress(true);
    try {
      const result = await vmService.deleteVM(selectedVM.name);
      if (result.success) {
        toast.success(result.message || "VM deleted successfully");
        refetch();
      } else {
        toast.error(result.message || "Failed to delete VM");
      }
    } catch (error) {
      console.error("Error deleting VM:", error);
      toast.error(`Failed to delete VM: ${(error as Error).message}`);
    } finally {
      setIsActionInProgress(false);
      setShowDeleteDialog(false);
      setSelectedVM(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return <Badge className="bg-green-500">Running</Badge>;
      case "stopped":
        return <Badge variant="outline">Stopped</Badge>;
      case "suspended":
        return <Badge variant="secondary">Suspended</Badge>;
      case "creating":
        return <Badge className="bg-blue-500">Creating</Badge>;
      default:
        return <Badge variant="destructive">Error</Badge>;
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading virtual machines...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        Error loading VMs.
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="ml-2"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex justify-end w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isActionInProgress}
          >
            Refresh
          </Button>
        </div>
      </div>

      {!vms || vms.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Virtual Machines</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center py-6 text-muted-foreground">
              No virtual machines found.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {vms.map((vm) => (
            <Card key={vm.id || vm.name} className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">{vm.name}</CardTitle>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(vm.status || "unknown")}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isActionInProgress}
                      >
                        <FiMoreVertical className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {vm.status === "running" ? (
                        <>
                          <DropdownMenuItem
                            onClick={() => handleVMAction(vm.name, "stop")}
                          >
                            Stop
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleVMAction(vm.name, "restart")}
                          >
                            Restart
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleVMAction(vm.name, "suspend")}
                          >
                            Suspend
                          </DropdownMenuItem>
                        </>
                      ) : vm.status === "suspended" ? (
                        <DropdownMenuItem
                          onClick={() => handleVMAction(vm.name, "resume")}
                        >
                          Resume
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => handleVMAction(vm.name, "start")}
                        >
                          Start
                        </DropdownMenuItem>
                      )}
                      {isAdmin && (
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setSelectedVM(vm);
                            setShowDeleteDialog(true);
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {vm.description && (
                    <p className="text-sm text-muted-foreground">
                      {vm.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-3 mt-2">
                    <div className="flex items-center text-sm">
                      <FiCpu className="mr-1 text-slate-500" /> {vm.vcpus || 1}{" "}
                      vCPUs
                    </div>
                    <div className="flex items-center text-sm">
                      <FaMemory className="mr-1 text-slate-500" />{" "}
                      {vm.memory || 1024} MB RAM
                    </div>
                    <div className="flex items-center text-sm">
                      <FiHardDrive className="mr-1 text-slate-500" />{" "}
                      {vm.storage || "10 GB"}
                    </div>
                  </div>
                  {vm.ip_address && (
                    <div className="text-sm mt-2">
                      <span className="font-medium">IP Address:</span>{" "}
                      {vm.ip_address}
                    </div>
                  )}
                  {vm.os_type && (
                    <div className="text-sm">
                      <span className="font-medium">OS:</span> {vm.os_type}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete VM Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the virtual machine{" "}
              <span className="font-bold">{selectedVM?.name}</span>. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isActionInProgress}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteVM}
              disabled={isActionInProgress}
              className="bg-red-600 hover:bg-red-700"
            >
              {isActionInProgress ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default VirtualMachinesList;
