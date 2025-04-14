
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './lib/auth';
import ProtectedRoute from './components/ProtectedRoute';

// Import pages
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import StudentPortal from './pages/StudentPortal';
import NotFound from './pages/NotFound';

// Admin subpages
import VmManagement from './pages/admin/VmManagement';
import UserManagement from './pages/admin/UserManagement';
import ResourceAllocation from './pages/admin/ResourceAllocation';
import Storage from './pages/admin/Storage';
import Network from './pages/admin/Network';
import SystemSettings from './pages/admin/SystemSettings';
import AiInsights from './pages/admin/AiInsights';

// Student subpages
import StudentVms from './pages/student/StudentVms';
import Assignments from './pages/student/Assignments';
import Documentation from './pages/student/Documentation';
import StudentResources from './pages/student/StudentResources';
import Help from './pages/student/Help';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/vms" element={<VmManagement />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/resources" element={<ResourceAllocation />} />
              <Route path="/admin/storage" element={<Storage />} />
              <Route path="/admin/network" element={<Network />} />
              <Route path="/admin/settings" element={<SystemSettings />} />
              <Route path="/admin/ai" element={<AiInsights />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student" element={<StudentPortal />} />
              <Route path="/student/vms" element={<StudentVms />} />
              <Route path="/student/assignments" element={<Assignments />} />
              <Route path="/student/documentation" element={<Documentation />} />
              <Route path="/student/resources" element={<StudentResources />} />
              <Route path="/student/help" element={<Help />} />
            </Route>

            {/* Fallback routes */}
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Router>
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
