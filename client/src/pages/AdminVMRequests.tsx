
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { vmService, VMRequest } from "@/services/vmService";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const AdminVMRequests: React.FC = () => {
  const [selectedRequest, setSelectedRequest] = useState<VMRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [vmName, setVmName] = useState("");

  const { data: requests, isLoading, error, refetch } = useQuery({
    queryKey: ["vm-requests"],
    queryFn: vmService.getAllVMRequests,
  });

  const handleApprove = async () => {
    if (!selectedRequest) return;

    setIsProcessing(true);
    try {
      const result = await vmService.approveVMRequest(selectedRequest.id, {
        name: vmName || undefined,
        memory: selectedRequest.memory,
        vcpus: selectedRequest.vcpus,
        storage: selectedRequest.storage,
        os_type: selectedRequest.os_type,
      });

      if (result.success) {
        toast.success("VM request approved");
        refetch();
      } else {
        toast.error(result.message || "Failed to approve VM request");
      }
    } catch (error) {
      console.error("Error approving VM request:", error);
      toast.error(`Error approving request: ${(error as Error).message}`);
    } finally {
      setIsProcessing(false);
      setShowApproveDialog(false);
      setSelectedRequest(null);
      setVmName("");
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    setIsProcessing(true);
    try {
      const result = await vmService.rejectVMRequest(
        selectedRequest.id, 
        rejectReason || "Your VM request has been rejected."
      );

      if (result.success) {
        toast.success("VM request rejected");
        refetch();
      } else {
        toast.error(result.message || "Failed to reject VM request");
      }
    } catch (error) {
      console.error("Error rejecting VM request:", error);
      toast.error(`Error rejecting request: ${(error as Error).message}`);
    } finally {
      setIsProcessing(false);
      setShowRejectDialog(false);
      setSelectedRequest(null);
      setRejectReason("");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="VM Requests" userType="admin">
        <div className="text-center py-8">Loading VM requests...</div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="VM Requests" userType="admin">
        <div className="text-center py-8 text-red-500">
          Error loading VM requests
          <Button variant="outline" className="ml-2" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="VM Requests" userType="admin">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">VM Requests</h1>
        <Button variant="outline" onClick={() => refetch()}>
          Refresh
        </Button>
      </div>

      {requests && requests.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Purpose</TableHead>
                <TableHead>Resources</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    {request.username || "Unknown"}
                  </TableCell>
                  <TableCell>{request.purpose}</TableCell>
                  <TableCell>
                    {request.vcpus && `${request.vcpus} vCPU • `}
                    {request.memory && `${request.memory} MB RAM • `}
                    {request.storage && `${request.storage} GB Storage`}
                  </TableCell>
                  <TableCell>{request.course || "N/A"}</TableCell>
                  <TableCell>{getStatusBadge(request.status)}</TableCell>
                  <TableCell>
                    {new Date(request.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {request.status === "pending" && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowApproveDialog(true);
                          }}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowRejectDialog(true);
                          }}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="bg-muted/30 border rounded-lg p-8 text-center">
          <p className="text-muted-foreground">No VM requests found</p>
        </div>
      )}

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve VM Request</DialogTitle>
            <DialogDescription>
              You are about to approve the VM request from{" "}
              {selectedRequest?.username || "unknown user"}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="vm-name">
                VM Name (optional)
              </label>
              <Input 
                id="vm-name" 
                value={vmName} 
                onChange={(e) => setVmName(e.target.value)}
                placeholder="Enter VM name or leave empty for auto-generated"
              />
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Requested Specifications</h4>
              <div className="bg-muted p-3 rounded text-sm">
                <p><strong>Purpose:</strong> {selectedRequest?.purpose}</p>
                <p><strong>vCPU:</strong> {selectedRequest?.vcpus || "Default"}</p>
                <p><strong>RAM:</strong> {selectedRequest?.memory ? `${selectedRequest.memory} MB` : "Default"}</p>
                <p><strong>Storage:</strong> {selectedRequest?.storage ? `${selectedRequest.storage} GB` : "Default"}</p>
                <p><strong>OS Type:</strong> {selectedRequest?.os_type || "Default"}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApproveDialog(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Approve and Create VM"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject VM Request</DialogTitle>
            <DialogDescription>
              You are about to reject the VM request from{" "}
              {selectedRequest?.username || "unknown user"}. Please provide a reason.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="reject-reason">
                Reason for rejection
              </label>
              <Textarea
                id="reject-reason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Provide a reason for rejection"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={isProcessing}>
              {isProcessing ? "Processing..." : "Reject Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminVMRequests;
