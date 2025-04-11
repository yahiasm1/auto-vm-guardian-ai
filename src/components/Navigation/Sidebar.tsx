
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  Server, 
  Cpu, 
  Database, 
  Network, 
  Users, 
  Settings, 
  Activity,
  BookOpen,
  FileText,
  HelpCircle
} from 'lucide-react';

interface SidebarProps {
  userType: 'admin' | 'student';
}

export const Sidebar: React.FC<SidebarProps> = ({ userType }) => {
  const location = useLocation();
  
  // Define navigation items based on user type
  const adminNavItems = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'VM Management', href: '/admin/vms', icon: Server },
    { name: 'Resource Allocation', href: '/admin/resources', icon: Cpu },
    { name: 'Storage', href: '/admin/storage', icon: Database },
    { name: 'Network', href: '/admin/network', icon: Network },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'System Settings', href: '/admin/settings', icon: Settings },
    { name: 'AI Insights', href: '/admin/ai-insights', icon: Activity }
  ];
  
  const studentNavItems = [
    { name: 'Dashboard', href: '/student', icon: Home },
    { name: 'My VMs', href: '/student/vms', icon: Server },
    { name: 'Resource Usage', href: '/student/resources', icon: Cpu },
    { name: 'Documentation', href: '/student/docs', icon: BookOpen },
    { name: 'Assignments', href: '/student/assignments', icon: FileText },
    { name: 'Help', href: '/student/help', icon: HelpCircle }
  ];
  
  const navItems = userType === 'admin' ? adminNavItems : studentNavItems;

  return (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-slate-200 dark:border-slate-700">
        <span className="text-xl font-bold text-vmSystem-blue dark:text-vmSystem-blue-light">
          VM Guardian
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive
                  ? "bg-vmSystem-blue text-white dark:bg-vmSystem-blue-dark"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-vmSystem-blue flex items-center justify-center text-white">
              {userType === 'admin' ? 'A' : 'S'}
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              {userType === 'admin' ? 'Admin User' : 'Student User'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {userType === 'admin' ? 'System Administrator' : 'Computer Science'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
