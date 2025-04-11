
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles: string[] }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has correct role
  if (allowedRoles && allowedRoles.length > 0) {
    // This would need to be fetched from the users table in a real implementation
    // For now we're simplifying by assuming all logged in users can access their respective sections
    // You should add role checking here based on your requirements
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/vms" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <VmManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/resources" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ResourceAllocation />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/storage" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Storage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/network" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Network />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UserManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/settings" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <SystemSettings />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/ai-insights" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AiInsights />
          </ProtectedRoute>
        } 
      />
      
      {/* Student Routes */}
      <Route 
        path="/student" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentPortal />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/vms" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentVms />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/resources" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentResources />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/docs" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <Documentation />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/assignments" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <Assignments />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/student/help" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <Help />
          </ProtectedRoute>
        } 
      />
      
      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
