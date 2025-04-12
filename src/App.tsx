
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import AdminDashboard from "./pages/AdminDashboard";
import VmManagement from "./pages/admin/VmManagement";
import ResourceAllocation from "./pages/admin/ResourceAllocation";
import Storage from "./pages/admin/Storage";
import Network from "./pages/admin/Network";
import UserManagement from "./pages/admin/UserManagement";
import SystemSettings from "./pages/admin/SystemSettings";
import AiInsights from "./pages/admin/AiInsights";
import CreateDummyUsers from "./pages/admin/CreateDummyUsers";
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
import Profile from "./pages/user/Profile";
import AuthCallback from "./pages/auth/AuthCallback";
import { useEffect } from "react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected route component that uses a proper role check
const ProtectedRoute = ({ children, allowedRoles }: { children: JSX.Element, allowedRoles: string[] }) => {
  const { user, session, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em]" role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
      </div>
    );
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
      <Route path="/auth/callback" element={<AuthCallback />} />
      
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
      <Route 
        path="/admin/profile" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Profile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/create-dummy-users" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <CreateDummyUsers />
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
      <Route 
        path="/student/profile" 
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <Profile />
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
