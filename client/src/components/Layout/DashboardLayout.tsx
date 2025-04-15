
import React, { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/lib/auth';
import { Button } from "@/components/ui/button";
import { FiLogOut } from "react-icons/fi";
import { Sidebar } from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  userType?: "admin" | "student" | "instructor";
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  title,
  userType = "admin"
}) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <Sidebar userType={userType} />
      
      <div className="flex-1 flex flex-col">
        <header className="bg-white dark:bg-slate-800 shadow-sm">
          <div className="px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-vmSystem-blue dark:text-vmSystem-blue-light">
              {title}
            </h1>
            
            <div className="flex items-center space-x-4">
              <div className="text-right mr-2">
                <p className="text-sm font-medium">{user?.name || user?.email}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                  {user?.role || "User"}
                </p>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                className="text-slate-600 hover:text-red-600"
              >
                <FiLogOut size={16} />
              </Button>
            </div>
          </div>
        </header>
        
        <main className="flex-1 px-6 py-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
          </div>
          
          {children}
        </main>
      </div>
    </div>
  );
};
