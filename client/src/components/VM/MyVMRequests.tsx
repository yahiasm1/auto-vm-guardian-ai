
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VMRequest, vmService } from "@/services/vmService";
import { useQuery } from "@tanstack/react-query";
import { FiClock, FiCheck, FiX, FiCpu, FiHardDrive } from "react-icons/fi";
import { FaMemory } from "react-icons/fa";

interface MyVMRequestsProps {
  onRefreshRequested?: () => void;
}

export function MyVMRequests({ onRefreshRequested }: MyVMRequestsProps) {
  const { data: requests, isLoading, error, refetch } = useQuery({
    queryKey: ["vmRequests", "my"],
    queryFn: () => vmService.getMyVMRequests(),
  });

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
    return <div className="p-4 text-center">Loading your VM requests...</div>;
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

  if (!requests || requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">My VM Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-6 text-muted-foreground">
            You haven't made any VM requests yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">My VM Requests</CardTitle>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request.id} className="border rounded-md p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{request.purpose}</h3>
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
              
              {request.response_message && (
                <div className="mt-2 p-2 bg-slate-50 rounded border text-sm">
                  <p className="font-medium">Administrator Response:</p>
                  <p>{request.response_message}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default MyVMRequests;
