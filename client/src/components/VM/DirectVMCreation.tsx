
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import vmService, { CreateVMPayload } from "@/services/vmService";
import userService from "@/services/userService";
import { vmTypeService } from "@/services/vmTypeService";

// Form schema validation
const vmFormSchema = z.object({
  name: z.string().min(3, "VM name must be at least 3 characters"),
  memory: z.coerce.number().min(512, "Min 512MB of RAM").max(16384, "Max 16GB of RAM"),
  vcpus: z.coerce.number().min(1, "Min 1 vCPU").max(16, "Max 16 vCPUs"),
  storage: z.coerce.number().min(5, "Min 5GB storage").max(500, "Max 500GB storage"),
  vm_type_id: z.string().min(1, "VM type is required"),
  description: z.string().optional(),
  user_id: z.string().optional(),
});

type VMFormValues = z.infer<typeof vmFormSchema>;

interface DirectVMCreationProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const DirectVMCreation: React.FC<DirectVMCreationProps> = ({ 
  isOpen, 
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Query to fetch users (students and instructors)
  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        return await userService.getUsers();
      } catch (error) {
        console.error("Failed to fetch users:", error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Query to fetch VM types
  const { data: vmTypes = [], isLoading: loadingVmTypes } = useQuery({
    queryKey: ['vm-types'],
    queryFn: vmTypeService.getAllVMTypes,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const form = useForm<VMFormValues>({
    resolver: zodResolver(vmFormSchema),
    defaultValues: {
      name: "",
      memory: 1024,
      vcpus: 1,
      storage: 10,
      vm_type_id: "",
      description: "",
      user_id: "",
    },
  });
  
  const handleSubmit = async (values: VMFormValues) => {
    setIsSubmitting(true);
    
    try {
      const selectedVmType = vmTypes.find(type => type.id === values.vm_type_id);
      
      const payload: CreateVMPayload = {
        ...values,
        // Convert memory to MB if entered in GB
        memory: values.memory < 100 ? values.memory * 1024 : values.memory,
        // Handle "none" value by setting user_id to null
        user_id: values.user_id === "none" ? null : values.user_id || null,
        // Add OS type from the selected VM type
        os_type: selectedVmType?.os_type || "linux",
        // Add ISO path from the selected VM type
        iso_path: selectedVmType?.iso_path,
      };
      
      await vmService.createVM(payload);
      form.reset();
      onSuccess();
      onClose();
      toast.success(`VM ${values.name} created successfully`);
    } catch (error) {
      console.error("Error creating VM:", error);
      toast.error(`Failed to create VM: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create Virtual Machine</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VM Name</FormLabel>
                  <FormControl>
                    <Input placeholder="myvm" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="vm_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>VM Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select VM Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {loadingVmTypes ? (
                        <SelectItem value="loading" disabled>Loading VM types...</SelectItem>
                      ) : vmTypes.length === 0 ? (
                        <SelectItem value="none" disabled>No VM types available</SelectItem>
                      ) : (
                        vmTypes.map((vmType) => (
                          <SelectItem key={vmType.id} value={vmType.id}>
                            {vmType.name} ({vmType.os_type})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="memory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Memory (MB)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="vcpus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>vCPUs</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="storage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Storage (GB)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assign to User</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || undefined}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a user" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Not assigned</SelectItem>
                      {loadingUsers ? (
                        <SelectItem value="loading" disabled>Loading users...</SelectItem>
                      ) : (
                        users?.filter(user => 
                          user.role === 'student' || user.role === 'instructor'
                        ).map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name || user.email} ({user.role})
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="VM description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create VM"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DirectVMCreation;
