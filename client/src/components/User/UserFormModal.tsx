import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import userService, {
  CreateUserPayload,
  UpdateUserPayload,
} from "@/services/userService";

const baseSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["admin", "instructor", "student"]),
  department: z.string().optional(),
});

const addSchema = baseSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const editSchema = baseSchema.extend({
  password: z.string().optional(),
});

type UserFormValues = z.infer<typeof addSchema>;

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: "add" | "edit";
  initialValues?: Partial<UserFormValues> & { id?: string };
}

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  mode,
  initialValues,
}) => {
  const isEditMode = mode === "edit";
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(isEditMode ? editSchema : addSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "student",
      department: "",
    },
  });

  useEffect(() => {
    if (isEditMode && initialValues) {
      form.reset({
        ...initialValues,
        password: "", // never pre-fill password on edit
      });
    } else {
      form.reset();
    }
  }, [initialValues, isEditMode, isOpen]);

  const handleSubmit = async (values: UserFormValues) => {
    setIsSubmitting(true);

    try {
      if (isEditMode && initialValues?.id) {
        const updatePayload: UpdateUserPayload = {
          id: initialValues.id,
          name: values.name,
          password: values.password || undefined,
          department: values.department,
          role: values.role,
        };
        await userService.updateUser(updatePayload);
        toast.success("User updated successfully");
      } else {
        const createPayload: CreateUserPayload = {
          ...values,
          department: values.department || undefined,
        };
        await userService.createUser(createPayload);
        toast.success("User created successfully");
      }

      form.reset();
      onSuccess();
      onClose();
    } catch (error) {
      console.error("User operation failed:", error);
      toast.error((error as Error).message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditMode ? "Edit User" : "Add User"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="user@example.com"
                      {...field}
                      disabled={isEditMode} // prevent email edits
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Password{" "}
                    {isEditMode && (
                      <span className="text-xs text-muted-foreground">
                        (leave blank to keep unchanged)
                      </span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="instructor">Instructor</SelectItem>
                        <SelectItem value="student">Student</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Computer Science" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                isLoading={isSubmitting}
              >
                {isEditMode ? "Update" : "Add User"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
