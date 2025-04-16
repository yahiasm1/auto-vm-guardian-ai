import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ScrollArea,
  ScrollBar,
} from "@/components/ui/scroll-area";
import {
  CpuIcon,
  DashboardIcon,
  GearIcon,
  LayersIcon,
  ServerIcon,
  UserIcon,
} from "@/lib/icons";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  userType: "admin" | "student" | "instructor";
  onCloseMobileSidebar?: () => void;
}

export const Sidebar = ({ userType, onCloseMobileSidebar }: SidebarProps) => {
  const location = useLocation();
  const isAdmin = userType === "admin";
  const isMobile = useMobile();

  const handleClick = () => {
    if (isMobile && onCloseMobileSidebar) {
      onCloseMobileSidebar();
    }
  };

  const adminNavigation = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: DashboardIcon,
      current: location.pathname === "/admin",
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: UserIcon,
      current: location.pathname === "/admin/users",
    },
    {
      name: "Virtual Machines",
      href: "/admin/vms",
      icon: ServerIcon,
      current: location.pathname === "/admin/vms",
    },
    {
      name: "VM Types",
      href: "/admin/vm-types",
      icon: LayersIcon,
      current: location.pathname === "/admin/vm-types",
    },
    {
      name: "VM Requests",
      href: "/admin/vm-requests",
      icon: CpuIcon,
      current: location.pathname === "/admin/vm-requests",
    },
    {
      name: "Settings",
      href: "/settings",
      icon: GearIcon,
      current: location.pathname === "/settings",
    },
  ];

  const studentNavigation = [
    {
      name: "Dashboard",
      href: "/student",
      icon: DashboardIcon,
      current: location.pathname === "/student",
    },
    {
      name: "My VMs",
      href: "/student/vms",
      icon: ServerIcon,
      current: location.pathname === "/student/vms",
    },
    {
      name: "Request VM",
      href: "/student/vm-requests",
      icon: CpuIcon,
      current: location.pathname === "/student/vm-requests",
    },
    {
      name: "Settings",
      href: "/settings",
      icon: GearIcon,
      current: location.pathname === "/settings",
    },
  ];

  const navigation = isAdmin ? adminNavigation : studentNavigation;

  return (
    <div className="flex shrink-0 flex-col h-screen bg-background border-r">
      <div className="flex px-6 py-5 h-16 items-center border-b">
        <Link to="/" className="flex items-center gap-2">
          <ServerIcon className="h-6 w-6" />
          <span className="text-lg font-semibold">VM Manager</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={handleClick}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                item.current
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
        <ScrollBar />
      </ScrollArea>
    </div>
  );
};

export default Sidebar;
