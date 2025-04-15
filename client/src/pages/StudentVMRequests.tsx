
import React from "react";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { MyVMRequests } from "@/components/VM/MyVMRequests";

const StudentVMRequestsPage: React.FC = () => {
  return (
    <DashboardLayout title="My VM Requests" userType="student">
      <MyVMRequests onRefreshRequested={() => {}} />
    </DashboardLayout>
  );
};

export default StudentVMRequestsPage;
