
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/authContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'instructor' | 'student';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // If still loading authentication status, display nothing yet
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-vmSystem-blue"></div>
      </div>
    );
  }
  
  // If user is not logged in, redirect to login page
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If specific role is required and user doesn't have it
  if (requiredRole && user.role !== requiredRole) {
    // Redirect based on user's role
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (user.role === 'student') {
      return <Navigate to="/student" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }
  
  return <>{children}</>;
};

export default ProtectedRoute;
