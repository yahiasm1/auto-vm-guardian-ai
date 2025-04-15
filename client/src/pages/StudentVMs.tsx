
import React from "react";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { VirtualMachinesList } from "@/components/VM/VirtualMachinesList";

const StudentVMsPage: React.FC = () => {
  return (
    <DashboardLayout title="My Virtual Machines" userType="student">
      <VirtualMachinesList />
    </DashboardLayout>
  );
};

export default StudentVMsPage;
