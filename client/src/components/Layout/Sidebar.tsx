
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiUsers, FiServer, FiClipboard, FiHome, FiMenu, FiX, FiSettings } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  userType?: "admin" | "student" | "instructor";
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: Array<"admin" | "student" | "instructor">;
}

export const Sidebar: React.FC<SidebarProps> = ({ userType = "admin" }) => {
  const location = useLocation();
  const isMobile = useMobile();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };
  
  const navItems: NavItem[] = [
    {
      label: "Dashboard",
      href: userType === "admin" ? "/admin" : `/student`,
      icon: <FiHome size={20} />,
      roles: ["admin", "student", "instructor"],
    },
    {
      label: "Virtual Machines",
      href: userType === "admin" ? "/admin/vms" : "/student/vms",
      icon: <FiServer size={20} />,
      roles: ["admin", "student", "instructor"],
    },
    {
      label: "VM Requests",
      href: userType === "admin" ? "/admin/vm-requests" : "/student/vm-requests",
      icon: <FiClipboard size={20} />,
      roles: ["admin", "student", "instructor"],
    },
    {
      label: "Users",
      href: "/admin/users",
      icon: <FiUsers size={20} />,
      roles: ["admin"],
    },
    {
      label: "Settings",
      href: "/settings",
      icon: <FiSettings size={20} />,
      roles: ["admin", "student", "instructor"],
    },
  ];
  
  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(
    (item) => item.roles.includes(userType)
  );
  
  const sidebarContent = (
    <div className="space-y-4 py-4">
      <div className="px-4 py-2">
        <h2 className="text-xl font-bold tracking-tight text-vmSystem-blue dark:text-vmSystem-blue-light">
          VM Manager
        </h2>
      </div>
      <nav className="space-y-1 px-2">
        {filteredNavItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center rounded-md px-3 py-3 text-sm font-medium transition-all",
              location.pathname === item.href
                ? "bg-slate-100 dark:bg-slate-700 text-vmSystem-blue dark:text-vmSystem-blue-light"
                : "text-slate-500 hover:text-vmSystem-blue hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-vmSystem-blue-light"
            )}
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );

  // Mobile version with hamburger menu
  if (isMobile) {
    return (
      <>
        <button
          onClick={toggleMobileMenu}
          className="fixed top-4 left-4 z-40 p-2 rounded-md bg-white dark:bg-slate-800 shadow-md"
        >
          {showMobileMenu ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
        
        {showMobileMenu && (
          <div className="fixed inset-0 z-30 bg-black bg-opacity-50" onClick={toggleMobileMenu} />
        )}
        
        <div
          className={cn(
            "fixed top-0 left-0 z-30 h-full w-64 shadow-lg bg-white dark:bg-slate-800 transition-transform transform",
            showMobileMenu ? "translate-x-0" : "-translate-x-full"
          )}
        >
          {sidebarContent}
        </div>
      </>
    );
  }

  // Desktop version
  return (
    <div className="hidden md:flex flex-col h-full w-64 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      {sidebarContent}
    </div>
  );
};
