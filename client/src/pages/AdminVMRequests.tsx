
import React from "react";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { AdminVMRequests } from "@/components/VM/AdminVMRequests";

const AdminVMRequestsPage: React.FC = () => {
  return (
    <DashboardLayout title="VM Requests" userType="admin">
      <AdminVMRequests />
    </DashboardLayout>
  );
};

export default AdminVMRequestsPage;
