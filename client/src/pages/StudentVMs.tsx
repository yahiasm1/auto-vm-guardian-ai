
import React from "react";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { VirtualMachinesList } from "@/components/VM/VirtualMachinesList";
import { useAuth } from "@/lib/auth";

const StudentVMsPage: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  
  return (
    <DashboardLayout title={isAdmin ? "Manage Virtual Machines" : "My Virtual Machines"} userType="student">
      <VirtualMachinesList />
    </DashboardLayout>
  );
};

export default StudentVMsPage;
