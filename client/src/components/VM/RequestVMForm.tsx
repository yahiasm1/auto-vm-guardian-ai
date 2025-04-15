
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { VMRequestPayload, vmService } from "@/services/vmService";

interface RequestVMFormProps {
  onRequestSubmitted?: () => void;
}

export function RequestVMForm({ onRequestSubmitted }: RequestVMFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<VMRequestPayload>({
    purpose: "",
    memory: 2048, // Default: 2GB
    vcpus: 2,
    storage: 20, // Default: 20GB
    os_type: "linux",
    course: "",
    duration: "1 month",
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof VMRequestPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.purpose) {
      toast.error("Please specify a purpose for this VM request");
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await vmService.requestVM(formData);
      
      if (result.success) {
        toast.success("VM request submitted successfully");
        // Reset form
        setFormData({
          purpose: "",
          memory: 2048,
          vcpus: 2,
          storage: 20,
          os_type: "linux",
          course: "",
          duration: "1 month",
          description: "",
        });
        // Trigger callback if provided
        if (onRequestSubmitted) onRequestSubmitted();
      } else {
        toast.error(result.message || "Failed to submit VM request");
      }
    } catch (error) {
      console.error("Error submitting VM request:", error);
      toast.error("An error occurred while submitting your request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Request a Virtual Machine</CardTitle>
        <CardDescription>
          Fill out this form to request a new virtual machine for your work or coursework.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Input
                id="purpose"
                name="purpose"
                placeholder="e.g., Course Project, Research, Lab Exercise"
                value={formData.purpose}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="course">Course/Project</Label>
              <Input
                id="course"
                name="course"
                placeholder="e.g., CS101, Research Project"
                value={formData.course}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="os_type">Operating System</Label>
                <Select
                  value={formData.os_type}
                  onValueChange={(value) => handleSelectChange("os_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select OS" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linux">Linux</SelectItem>
                    <SelectItem value="windows">Windows</SelectItem>
                    <SelectItem value="macos">macOS</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="duration">Duration</Label>
                <Select
                  value={formData.duration}
                  onValueChange={(value) => handleSelectChange("duration", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 week">1 week</SelectItem>
                    <SelectItem value="2 weeks">2 weeks</SelectItem>
                    <SelectItem value="1 month">1 month</SelectItem>
                    <SelectItem value="3 months">3 months</SelectItem>
                    <SelectItem value="6 months">6 months</SelectItem>
                    <SelectItem value="1 semester">1 semester</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="memory">Memory (MB)</Label>
                <Input
                  id="memory"
                  name="memory"
                  type="number"
                  min="1024"
                  step="1024"
                  value={formData.memory}
                  onChange={handleNumberChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="vcpus">vCPUs</Label>
                <Input
                  id="vcpus"
                  name="vcpus"
                  type="number"
                  min="1"
                  value={formData.vcpus}
                  onChange={handleNumberChange}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="storage">Storage (GB)</Label>
                <Input
                  id="storage"
                  name="storage"
                  type="number"
                  min="5"
                  value={formData.storage}
                  onChange={handleNumberChange}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Additional Details</Label>
              <Textarea
                id="description"
                name="description"
                rows={4}
                placeholder="Please provide any additional information that might help us process your request"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export default RequestVMForm;
