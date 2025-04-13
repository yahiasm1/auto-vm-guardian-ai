
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { AuthProvider } from '@/lib/mockAuth';
import Login from '@/pages/auth/Login';
import Signup from '@/pages/auth/Signup';
import AuthCallback from '@/pages/auth/AuthCallback';
import AdminDashboard from '@/pages/AdminDashboard';
import StudentPortal from '@/pages/StudentPortal';
import NotFound from '@/pages/NotFound';
import Profile from '@/pages/user/Profile';
import ProtectedRoute from '@/components/Auth/ProtectedRoute';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vm-management-theme">
      <AuthProvider>
        <Toaster position="top-right" richColors />
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          
          {/* Protected Admin Routes */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* Protected Student Routes */}
          <Route 
            path="/student/*" 
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentPortal />
              </ProtectedRoute>
            } 
          />

          {/* Profile Page - Accessible to all authenticated users */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute allowedRoles={['admin', 'student', 'instructor']}>
                <Profile />
              </ProtectedRoute>
            } 
          />
          
          {/* Default redirect to login */}
          <Route path="/" element={<Login />} />
          
          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
