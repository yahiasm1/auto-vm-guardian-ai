
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import VmManagement from "./pages/admin/VmManagement";
import ResourceAllocation from "./pages/admin/ResourceAllocation";
import Storage from "./pages/admin/Storage";
import Network from "./pages/admin/Network";
import UserManagement from "./pages/admin/UserManagement";
import SystemSettings from "./pages/admin/SystemSettings";
import AiInsights from "./pages/admin/AiInsights";
import StudentPortal from "./pages/StudentPortal";
import StudentVms from "./pages/student/StudentVms";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<Index />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/vms" element={<VmManagement />} />
          <Route path="/admin/resources" element={<ResourceAllocation />} />
          <Route path="/admin/storage" element={<Storage />} />
          <Route path="/admin/network" element={<Network />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/settings" element={<SystemSettings />} />
          <Route path="/admin/ai-insights" element={<AiInsights />} />
          
          {/* Student Routes */}
          <Route path="/student" element={<StudentPortal />} />
          <Route path="/student/vms" element={<StudentVms />} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
