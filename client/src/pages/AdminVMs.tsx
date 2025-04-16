import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { vmService, VM } from "@/services/vmService";
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FiMoreVertical, FiPlus } from "react-icons/fi";
import { DirectVMCreation } from "@/components/VM/DirectVMCreation";

const AdminVMsPage: React.FC = () => {
  const [selectedVM, setSelectedVM] = useState<VM | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: vms, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-vms"],
    queryFn: vmService.listVMs,
  });

  const handleVMAction = async (
    vmName: string,
    action: "start" | "stop" | "restart" | "suspend" | "resume"
  ) => {
    setIsProcessing(true);
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
      setIsProcessing(false);
    }
  };

  const handleDeleteVM = async () => {
    if (!selectedVM) return;

    setIsProcessing(true);
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
      setIsProcessing(false);
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
    return (
      <DashboardLayout title="Virtual Machines" userType="admin">
        <div className="text-center py-8">Loading virtual machines...</div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Virtual Machines" userType="admin">
        <div className="text-center py-8 text-red-500">
          Error loading VMs
          <Button variant="outline" className="ml-2" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Virtual Machines" userType="admin">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Virtual Machines</h1>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-1"
          >
            <FiPlus size={16} />
            <span>Create VM</span>
          </Button>
          <Button variant="outline" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </div>

      {vms && vms.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>OS Type</TableHead>
                <TableHead>Resources</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vms.map((vm) => (
                <TableRow key={vm.id || vm.name}>
                  <TableCell className="font-medium">{vm.name}</TableCell>
                  <TableCell>{getStatusBadge(vm.status || "unknown")}</TableCell>
                  <TableCell>{vm.os_type || "unknown"}</TableCell>
                  <TableCell>
                    {vm.vcpus && `${vm.vcpus} vCPU • `}
                    {vm.memory && `${vm.memory} MB RAM • `}
                    {typeof vm.storage === 'string' ? vm.storage : `${vm.storage} GB`}
                  </TableCell>
                  <TableCell>{vm.ip_address || "N/A"}</TableCell>
                  <TableCell>
                    {vm.created_at
                      ? new Date(vm.created_at).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={isProcessing}>
                          <FiMoreVertical className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {vm.status === "running" ? (
                          <>
                            <DropdownMenuItem onClick={() => handleVMAction(vm.name, "stop")}>
                              Stop
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleVMAction(vm.name, "restart")}>
                              Restart
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleVMAction(vm.name, "suspend")}>
                              Suspend
                            </DropdownMenuItem>
                          </>
                        ) : vm.status === "suspended" ? (
                          <DropdownMenuItem onClick={() => handleVMAction(vm.name, "resume")}>
                            Resume
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem onClick={() => handleVMAction(vm.name, "start")}>
                            Start
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setSelectedVM(vm);
                            setShowDeleteDialog(true);
                          }}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="bg-muted/30 border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">No virtual machines found</p>
        </div>
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Virtual Machine</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the VM "{selectedVM?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteVM} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Delete VM"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DirectVMCreation
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={() => {
          refetch();
        }}
      />
    </DashboardLayout>
  );
};

export default AdminVMsPage;
