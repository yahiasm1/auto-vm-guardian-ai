
import React from 'react';
import { Sidebar } from '../Navigation/Sidebar';
import { User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NotificationsPopover } from '../Notifications/NotificationsPopover';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

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
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to sign out:', error);
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
              <NotificationsPopover />
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User size={20} />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56" align="end">
                  <div className="space-y-1">
                    <p className="font-medium">{user?.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {userType === 'admin' ? 'Administrator' : 'Student User'}
                    </p>
                  </div>
                  <div className="flex flex-col pt-4 gap-2">
                    <Link 
                      to={`/${userType}/profile`}
                      className="text-sm px-2 py-1.5 hover:bg-muted rounded-md"
                    >
                      Profile Settings
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="text-sm px-2 py-1.5 hover:bg-muted rounded-md text-left text-red-500"
                    >
                      Sign Out
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
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
