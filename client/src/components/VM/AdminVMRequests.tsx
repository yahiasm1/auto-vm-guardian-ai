
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { VMRequest, CreateVMPayload, vmService } from "@/services/vmService";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { FiCpu, FiHardDrive, FiCheck, FiX, FiClock, FiUser } from "react-icons/fi";
import { FaMemory } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export function AdminVMRequests() {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<VMRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [vmConfig, setVmConfig] = useState<CreateVMPayload>({
    name: "",
    memory: 2048,
    vcpus: 2,
    storage: 20,
    os_type: "linux",
  });
  
  const { data: requests, isLoading, error, refetch } = useQuery({
    queryKey: ["vmRequests", "admin"],
    queryFn: () => vmService.getAllVMRequests(),
  });

  const openRejectDialog = (request: VMRequest) => {
    setSelectedRequest(request);
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const openApproveDialog = (request: VMRequest) => {
    setSelectedRequest(request);
    // Pre-fill VM config with request details
    setVmConfig({
      name: `vm-${request.id.substring(0, 8)}`,
      memory: request.memory || 2048,
      vcpus: request.vcpus || 2,
      storage: request.storage || 20,
      os_type: request.os_type || "linux",
      description: `VM created for ${request.purpose}${request.course ? ` - Course: ${request.course}` : ''}`,
    });
    setApproveDialogOpen(true);
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest) return;
    
    try {
      const result = await vmService.rejectVMRequest(selectedRequest.id, rejectReason);
      
      if (result.success) {
        toast.success("VM request rejected");
        setRejectDialogOpen(false);
        refetch();
      } else {
        toast.error(result.message || "Failed to reject VM request");
      }
    } catch (error) {
      console.error("Error rejecting VM request:", error);
      toast.error("An error occurred while rejecting the request");
    }
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest) return;
    
    if (!vmConfig.name) {
      toast.error("VM name is required");
      return;
    }
    
    try {
      const result = await vmService.approveVMRequest(selectedRequest.id, vmConfig);
      
      if (result.success) {
        toast.success("VM request approved and VM created");
        setApproveDialogOpen(false);
        refetch();
      } else {
        toast.error(result.message || "Failed to approve VM request");
      }
    } catch (error) {
      console.error("Error approving VM request:", error);
      toast.error("An error occurred while approving the request");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-600 border-green-200">
            <FiCheck className="mr-1" /> Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-600 border-red-200">
            <FiX className="mr-1" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-600 border-amber-200">
            <FiClock className="mr-1" /> Pending
          </Badge>
        );
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading VM requests...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600">
        Error loading requests. 
        <Button variant="outline" size="sm" onClick={() => refetch()} className="ml-2">
          Try Again
        </Button>
      </div>
    );
  }

  const pendingRequests = requests?.filter(req => req.status === "pending") || [];
  const otherRequests = requests?.filter(req => req.status !== "pending") || [];

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">VM Requests</CardTitle>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {(!requests || requests.length === 0) ? (
            <p className="text-center py-6 text-muted-foreground">
              There are no VM requests to display.
            </p>
          ) : (
            <div className="space-y-6">
              {pendingRequests.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-md font-medium">Pending Requests ({pendingRequests.length})</h3>
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="border rounded-md p-4 bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{request.purpose}</h3>
                          <div className="text-sm flex items-center text-muted-foreground">
                            <FiUser className="mr-1" /> 
                            {request.username || "Unknown User"}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Requested on {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                      
                      {request.course && (
                        <p className="text-sm mb-2">
                          <span className="font-medium">Course/Project:</span> {request.course}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-3 mt-2">
                        <div className="flex items-center text-sm">
                          <FiCpu className="mr-1 text-slate-500" /> {request.vcpus || 1} vCPUs
                        </div>
                        <div className="flex items-center text-sm">
                          <FaMemory className="mr-1 text-slate-500" /> {request.memory || 1024} MB RAM
                        </div>
                        <div className="flex items-center text-sm">
                          <FiHardDrive className="mr-1 text-slate-500" /> {request.storage || 10} GB
                        </div>
                        <div className="flex items-center text-sm">
                          Duration: {request.duration || "Not specified"}
                        </div>
                      </div>
                      
                      {request.description && (
                        <div className="mt-2 text-sm">
                          <p className="font-medium">Details:</p>
                          <p className="text-muted-foreground">{request.description}</p>
                        </div>
                      )}
                      
                      <div className="mt-4 flex gap-2 justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => openRejectDialog(request)}
                        >
                          Reject
                        </Button>
                        <Button 
                          size="sm"
                          className="bg-green-600 hover:bg-green-700" 
                          onClick={() => openApproveDialog(request)}
                        >
                          Approve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {otherRequests.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-md font-medium">Processed Requests ({otherRequests.length})</h3>
                  {otherRequests.map((request) => (
                    <div key={request.id} className="border rounded-md p-4 bg-white">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{request.purpose}</h3>
                          <div className="text-sm flex items-center text-muted-foreground">
                            <FiUser className="mr-1" /> 
                            {request.username || "Unknown User"}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Requested on {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                      
                      {request.course && (
                        <p className="text-sm mb-2">
                          <span className="font-medium">Course/Project:</span> {request.course}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap gap-3 mt-2">
                        <div className="flex items-center text-sm">
                          <FiCpu className="mr-1 text-slate-500" /> {request.vcpus || 1} vCPUs
                        </div>
                        <div className="flex items-center text-sm">
                          <FaMemory className="mr-1 text-slate-500" /> {request.memory || 1024} MB RAM
                        </div>
                        <div className="flex items-center text-sm">
                          <FiHardDrive className="mr-1 text-slate-500" /> {request.storage || 10} GB
                        </div>
                      </div>
                      
                      {request.response_message && (
                        <div className="mt-2 p-2 bg-slate-50 rounded border text-sm">
                          <p className="font-medium">Response:</p>
                          <p>{request.response_message}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Reject Request Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject VM Request</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rejectReason">Reason for rejection (will be shown to the user)</Label>
            <Textarea
              id="rejectReason"
              placeholder="Please provide a reason for rejecting this VM request"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleRejectRequest}>Reject Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Approve Request Dialog */}
      <Dialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve & Create VM</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="vmName">VM Name</Label>
                <Input
                  id="vmName"
                  value={vmConfig.name}
                  onChange={(e) => setVmConfig({...vmConfig, name: e.target.value})}
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="memory">Memory (MB)</Label>
                  <Input
                    id="memory"
                    type="number"
                    min="1024"
                    step="1024"
                    value={vmConfig.memory}
                    onChange={(e) => setVmConfig({...vmConfig, memory: Number(e.target.value)})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="vcpus">vCPUs</Label>
                  <Input
                    id="vcpus"
                    type="number"
                    min="1"
                    value={vmConfig.vcpus}
                    onChange={(e) => setVmConfig({...vmConfig, vcpus: Number(e.target.value)})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="storage">Storage (GB)</Label>
                  <Input
                    id="storage"
                    type="number"
                    min="5"
                    value={vmConfig.storage}
                    onChange={(e) => setVmConfig({...vmConfig, storage: Number(e.target.value)})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="osType">OS Type</Label>
                  <Input
                    id="osType"
                    value={vmConfig.os_type}
                    onChange={(e) => setVmConfig({...vmConfig, os_type: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={vmConfig.description}
                  onChange={(e) => setVmConfig({...vmConfig, description: e.target.value})}
                  rows={2}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleApproveRequest}>Approve & Create VM</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default AdminVMRequests;
