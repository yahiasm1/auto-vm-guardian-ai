import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  FiLayout, 
  FiMonitor, 
  FiFileText, 
  FiUsers, 
  FiSettings, 
  FiChevronLeft, 
  FiChevronRight, 
  FiLogOut 
} from "react-icons/fi";
import { useAuth } from "@/lib/auth";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  isActive: boolean;
  isCollapsed: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ 
  href, 
  icon, 
  text, 
  isActive,
  isCollapsed
}) => {
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <Link to={href}>
          <Button
            variant="ghost"
            size="lg"
            className={cn(
              "w-full justify-start gap-3 px-3",
              isCollapsed ? "justify-center p-2" : "px-4",
              isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
            )}
          >
            {icon}
            {!isCollapsed && <span>{text}</span>}
          </Button>
        </Link>
      </TooltipTrigger>
      {isCollapsed && <TooltipContent side="right">{text}</TooltipContent>}
    </Tooltip>
  );
};

interface SidebarProps {
  userType: "admin" | "student" | "instructor";
}

export const Sidebar: React.FC<SidebarProps> = ({ userType }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();
  
  const isLinkActive = (path: string) => location.pathname.startsWith(path);

  const getNavigationItems = () => {
    const commonItems = [
      {
        href: `/${userType}`,
        icon: <FiLayout size={20} />,
        text: "Dashboard",
      },
      {
        href: `/${userType}/vms`,
        icon: <FiMonitor size={20} />,
        text: "Virtual Machines",
      },
    ];
    
    if (userType === "admin") {
      return [
        ...commonItems,
        {
          href: "/admin/vm-requests",
          icon: <FiFileText size={20} />,
          text: "VM Requests",
        },
        {
          href: "/admin/users",
          icon: <FiUsers size={20} />,
          text: "User Management",
        },
        {
          href: "/admin/settings",
          icon: <FiSettings size={20} />,
          text: "System Settings",
        },
      ];
    } else {
      return [
        ...commonItems,
        {
          href: `/${userType}/vm-requests`,
          icon: <FiFileText size={20} />,
          text: "My VM Requests",
        },
        {
          href: `/${userType}/settings`,
          icon: <FiSettings size={20} />,
          text: "Settings",
        },
      ];
    }
  };
  
  const navigationItems = getNavigationItems();

  return (
    <div className={cn(
      "flex flex-col h-full bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-all duration-300",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
        {!collapsed && (
          <h2 className="text-lg font-semibold text-vmSystem-blue dark:text-vmSystem-blue-light">
            VM Guardian
          </h2>
        )}
        <Button 
          variant="ghost" 
          size="sm"
          className="ml-auto"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <FiChevronRight size={18} /> : <FiChevronLeft size={18} />}
        </Button>
      </div>
      
      <div className="flex-1 py-6 flex flex-col gap-2">
        {navigationItems.map((item) => (
          <SidebarLink
            key={item.href}
            href={item.href}
            icon={item.icon}
            text={item.text}
            isActive={isLinkActive(item.href)}
            isCollapsed={collapsed}
          />
        ))}
      </div>
      
      <div className="mt-auto border-t border-slate-200 dark:border-slate-700 p-4">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="lg"
              className={cn(
                "w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/10 gap-3",
                collapsed ? "justify-center p-2" : "px-4"
              )}
              onClick={signOut}
            >
              <FiLogOut size={20} />
              {!collapsed && <span>Logout</span>}
            </Button>
          </TooltipTrigger>
          {collapsed && <TooltipContent side="right">Logout</TooltipContent>}
        </Tooltip>
      </div>
    </div>
  );
};
