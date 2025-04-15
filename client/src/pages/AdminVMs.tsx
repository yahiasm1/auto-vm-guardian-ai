
import React from "react";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { VirtualMachinesList } from "@/components/VM/VirtualMachinesList";

const AdminVMsPage: React.FC = () => {
  return (
    <DashboardLayout title="Virtual Machines" userType="admin">
      <VirtualMachinesList />
    </DashboardLayout>
  );
};

export default AdminVMsPage;
