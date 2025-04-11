
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { vmService } from '@/services/vmService';

const vmFormSchema = z.object({
  name: z.string().min(3, { message: 'VM name must be at least 3 characters long' }),
  os: z.string().min(1, { message: 'Please select an operating system' }),
  cpuCores: z.number().min(1).max(16),
  ramGB: z.number().min(1).max(64),
  storageGB: z.number().min(10).max(1000),
  networkType: z.enum(['bridged', 'nat']),
  assignToUser: z.string().optional(),
  courseId: z.string().optional(),
});

type VmFormValues = z.infer<typeof vmFormSchema>;

const defaultValues: Partial<VmFormValues> = {
  cpuCores: 2,
  ramGB: 4,
  storageGB: 50,
  networkType: 'bridged',
};

interface VmCreationFormProps {
  onSubmit: (values: VmFormValues) => void;
  isCreating?: boolean;
}

// Define the template type
type Template = {
  id: string;
  name: string;
  os: string;
  description: string | null;
  cpu: number;
  ram: number;
  storage: number;
};

export const VmCreationForm: React.FC<VmCreationFormProps> = ({
  onSubmit,
  isCreating = false,
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [loadingTemplates, setLoadingTemplates] = useState(false);

  const form = useForm<VmFormValues>({
    resolver: zodResolver(vmFormSchema),
    defaultValues,
  });

  // Fetch VM templates when component mounts
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      try {
        const templatesData = await vmService.getVMTemplates();
        setTemplates(templatesData || []);
      } catch (error) {
        console.error('Error loading templates:', error);
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchTemplates();
  }, []);

  // Apply template when selected
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    
    if (!templateId) return;
    
    const template = templates.find(t => t.id === templateId);
    if (template) {
      form.setValue('os', template.os);
      form.setValue('cpuCores', template.cpu);
      form.setValue('ramGB', template.ram);
      form.setValue('storageGB', template.storage);
    }
  };

  const handleSubmit = async (values: VmFormValues) => {
    try {
      // Map form values to VM structure
      const vmData = {
        name: values.name,
        os: values.os,
        cpu: values.cpuCores,
        ram: values.ramGB,
        storage: values.storageGB,
        course: values.courseId || null,
        user_id: values.assignToUser || null,
      };
      
      // Call the vmService to create VM
      await vmService.createVM(vmData);
      
      // Call the onSubmit callback to close dialog or perform UI updates
      onSubmit(values);
    } catch (error) {
      console.error('Error in form submission:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Virtual Machine</CardTitle>
        <CardDescription>
          Configure the specifications for your new virtual machine.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Template Selection */}
            <div className="mb-6">
              <FormLabel className="mb-2 block">Use Template (Optional)</FormLabel>
              <Select
                value={selectedTemplate}
                onValueChange={handleTemplateChange}
                disabled={loadingTemplates || templates.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingTemplates ? 'Loading templates...' : 'Select a template'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {templates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} ({template.description})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>VM Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter VM name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="os"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Operating System</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select OS" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ubuntu20.04">Ubuntu 20.04 LTS</SelectItem>
                        <SelectItem value="ubuntu22.04">Ubuntu 22.04 LTS</SelectItem>
                        <SelectItem value="debian11">Debian 11</SelectItem>
                        <SelectItem value="centos8">CentOS 8</SelectItem>
                        <SelectItem value="windows10">Windows 10</SelectItem>
                        <SelectItem value="windows11">Windows 11</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpuCores"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPU Cores: {field.value}</FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={16}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="py-4"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ramGB"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RAM (GB): {field.value} GB</FormLabel>
                    <FormControl>
                      <Slider
                        min={1}
                        max={64}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="py-4"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="storageGB"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Storage (GB): {field.value} GB</FormLabel>
                    <FormControl>
                      <Slider
                        min={10}
                        max={1000}
                        step={10}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="py-4"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="networkType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Network Type</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select network type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bridged">Bridged</SelectItem>
                        <SelectItem value="nat">NAT</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assignToUser"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign to User (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="User ID or email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <CardFooter className="px-0 pt-4">
              <Button type="submit" className="w-full" disabled={isCreating}>
                {isCreating ? 'Creating VM...' : 'Create Virtual Machine'}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
