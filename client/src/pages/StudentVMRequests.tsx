
import React from "react";
import { DashboardLayout } from "@/components/Layout/DashboardLayout";
import { MyVMRequests } from "@/components/VM/MyVMRequests";
import RequestVMForm from "@/components/VM/RequestVMForm";

const StudentVMRequestsPage: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <DashboardLayout title="VM Requests" userType="student">
      <div className="space-y-8">
        <RequestVMForm onRequestSubmitted={handleRefresh} />
        
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">My Previous Requests</h2>
          <MyVMRequests onRefreshRequested={handleRefresh} key={refreshTrigger} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentVMRequestsPage;
