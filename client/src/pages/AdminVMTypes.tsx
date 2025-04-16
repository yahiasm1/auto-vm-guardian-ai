import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { VMType, vmTypeService } from "@/services/vmTypeService";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { VMTypeForm } from "@/components/VM/VMTypeForm";
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
import { FiEdit, FiMoreVertical, FiPlus, FiTrash2 } from "react-icons/fi";

const AdminVMTypesPage: React.FC = () => {
  const [selectedVMType, setSelectedVMType] = useState<VMType | null>(null);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const {
    data: vmTypes = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["vm-types"],
    queryFn: vmTypeService.getAllVMTypes,
  });

  const handleCreateClick = () => {
    setSelectedVMType(null);
    setIsEditing(false);
    setShowFormDialog(true);
  };

  const handleEditClick = (vmType: VMType) => {
    setSelectedVMType(vmType);
    setIsEditing(true);
    setShowFormDialog(true);
  };

  const handleDeleteClick = (vmType: VMType) => {
    setSelectedVMType(vmType);
    setShowDeleteDialog(true);
  };

  const handleFormSubmit = async (formData: any) => {
    setIsSubmitting(true);
    try {
      let result;

      if (isEditing && selectedVMType) {
        result = await vmTypeService.updateVMType(selectedVMType.id, formData);
      } else {
        result = await vmTypeService.createVMType(formData);
      }

      if (result.success) {
        toast.success(result.message);
        setShowFormDialog(false);
        refetch();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error submitting VM type:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedVMType) return;

    setIsSubmitting(true);
    try {
      const result = await vmTypeService.deleteVMType(selectedVMType.id);

      if (result.success) {
        toast.success(result.message);
        setShowDeleteDialog(false);
        refetch();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error deleting VM type:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="VM Types" userType="admin">
        <div className="text-center py-8">Loading VM types...</div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="VM Types" userType="admin">
        <div className="text-center py-8 text-red-500">
          Error loading VM types
          <Button variant="outline" className="ml-2" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="VM Types" userType="admin">
      <div className="flex justify-end mb-6">
        <div className="flex gap-2">
          <Button
            onClick={handleCreateClick}
            className="flex items-center gap-1"
          >
            <FiPlus size={16} />
            <span>Add VM Type</span>
          </Button>
          <Button variant="outline" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>
      </div>

      {vmTypes.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>OS Type</TableHead>
                <TableHead>ISO Path</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vmTypes.map((vmType) => (
                <TableRow key={vmType.id}>
                  <TableCell className="font-medium">{vmType.name}</TableCell>
                  <TableCell>{vmType.os_type}</TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate">
                      {vmType.iso_path || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[300px] truncate">
                      {vmType.description || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={isSubmitting}
                        >
                          <FiMoreVertical className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEditClick(vmType)}
                          className="flex items-center"
                        >
                          <FiEdit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 flex items-center"
                          onClick={() => handleDeleteClick(vmType)}
                        >
                          <FiTrash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
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
          <p className="text-muted-foreground">No VM types found</p>
        </div>
      )}

      {/* Create/Edit Form Dialog */}
      <Dialog open={showFormDialog} onOpenChange={setShowFormDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit VM Type" : "Add VM Type"}
            </DialogTitle>
          </DialogHeader>
          <VMTypeForm
            initialData={isEditing ? selectedVMType! : undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => setShowFormDialog(false)}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete VM Type</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the VM type "
              {selectedVMType?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminVMTypesPage;
