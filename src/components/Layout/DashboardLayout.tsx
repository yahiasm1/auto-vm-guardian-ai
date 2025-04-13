
import React from 'react';
import { Sidebar } from '../Navigation/Sidebar';
import { useAuth } from '@/lib/authContext';
import { useNavigate } from 'react-router-dom';
import { User, BellRing, Menu, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  userType: 'admin' | 'student';
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  children, 
  title,
  userType 
}) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to log out');
    }
  };
  
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-10 w-64 transform bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Sidebar userType={userType} />
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden" 
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu size={20} />
              </Button>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h1>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon">
                <BellRing size={20} />
              </Button>
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-sm font-medium">{profile?.full_name || user?.email || 'User'}</span>
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Log out">
                  <LogOut size={18} />
                </Button>
              </div>
              <Button variant="ghost" size="icon" className="md:hidden">
                <User size={20} />
              </Button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-50 dark:bg-slate-900">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-5 bg-black bg-opacity-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};
