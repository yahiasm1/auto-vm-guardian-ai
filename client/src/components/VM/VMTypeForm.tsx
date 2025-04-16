
import React, { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VMType } from "@/services/vmTypeService";

// Form schema
const vmTypeSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  os_type: z.string().min(1, "OS type is required"),
  iso_path: z.string().optional(),
  description: z.string().optional(),
});

type VMTypeFormValues = z.infer<typeof vmTypeSchema>;

interface VMTypeFormProps {
  initialData?: VMType;
  onSubmit: (data: VMTypeFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function VMTypeForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: VMTypeFormProps) {
  const form = useForm<VMTypeFormValues>({
    resolver: zodResolver(vmTypeSchema),
    defaultValues: {
      name: initialData?.name || "",
      os_type: initialData?.os_type || "linux",
      iso_path: initialData?.iso_path || "",
      description: initialData?.description || "",
    },
  });

  // Re-populate form when initialData changes (e.g., when editing)
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        os_type: initialData.os_type,
        iso_path: initialData.iso_path || "",
        description: initialData.description || "",
      });
    }
  }, [initialData, form]);

  const handleFormSubmit = async (values: VMTypeFormValues) => {
    await onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Ubuntu 22.04 LTS" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="os_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>OS Type</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select OS Type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="linux">Linux</SelectItem>
                  <SelectItem value="windows">Windows</SelectItem>
                  <SelectItem value="macos">macOS</SelectItem>
                  <SelectItem value="freebsd">FreeBSD</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="iso_path"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ISO Path</FormLabel>
              <FormControl>
                <Input
                  placeholder="/path/to/iso/ubuntu-22.04.iso"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Ubuntu Desktop Long Term Support release"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : initialData ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
