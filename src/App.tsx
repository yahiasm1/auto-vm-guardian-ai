
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
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
import StudentResources from "./pages/student/StudentResources";
import Documentation from "./pages/student/Documentation";
import Assignments from "./pages/student/Assignments";
import Help from "./pages/student/Help";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/vms" element={
              <ProtectedRoute requiredRole="admin">
                <VmManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/resources" element={
              <ProtectedRoute requiredRole="admin">
                <ResourceAllocation />
              </ProtectedRoute>
            } />
            <Route path="/admin/storage" element={
              <ProtectedRoute requiredRole="admin">
                <Storage />
              </ProtectedRoute>
            } />
            <Route path="/admin/network" element={
              <ProtectedRoute requiredRole="admin">
                <Network />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute requiredRole="admin">
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute requiredRole="admin">
                <SystemSettings />
              </ProtectedRoute>
            } />
            <Route path="/admin/ai-insights" element={
              <ProtectedRoute requiredRole="admin">
                <AiInsights />
              </ProtectedRoute>
            } />
            
            {/* Student Routes */}
            <Route path="/student" element={
              <ProtectedRoute requiredRole="student">
                <StudentPortal />
              </ProtectedRoute>
            } />
            <Route path="/student/vms" element={
              <ProtectedRoute requiredRole="student">
                <StudentVms />
              </ProtectedRoute>
            } />
            <Route path="/student/resources" element={
              <ProtectedRoute requiredRole="student">
                <StudentResources />
              </ProtectedRoute>
            } />
            <Route path="/student/docs" element={
              <ProtectedRoute requiredRole="student">
                <Documentation />
              </ProtectedRoute>
            } />
            <Route path="/student/assignments" element={
              <ProtectedRoute requiredRole="student">
                <Assignments />
              </ProtectedRoute>
            } />
            <Route path="/student/help" element={
              <ProtectedRoute requiredRole="student">
                <Help />
              </ProtectedRoute>
            } />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
