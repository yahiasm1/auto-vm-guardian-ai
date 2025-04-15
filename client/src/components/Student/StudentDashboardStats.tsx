
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { FiMonitor, FiClock, FiCheck } from "react-icons/fi";

interface StudentDashboardStatsProps {
  totalVms: number;
  runningVms: number;
  pendingRequests: number;
}

export const StudentDashboardStats = ({ totalVms, runningVms, pendingRequests }: StudentDashboardStatsProps) => {
  const statItems = [
    {
      name: "Total VMs",
      value: totalVms,
      icon: <FiMonitor size={18} />,
      className: "bg-blue-50 text-blue-600",
    },
    {
      name: "Running VMs",
      value: runningVms,
      icon: <FiCheck size={18} />,
      className: "bg-green-50 text-green-600",
    },
    {
      name: "Pending Requests",
      value: pendingRequests,
      icon: <FiClock size={18} />,
      className: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {statItems.map((item) => (
        <Card key={item.name} className="border-0 shadow-sm">
          <CardContent className="p-4 flex items-center space-x-4">
            <div className={`p-2 rounded-lg ${item.className}`}>
              {item.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{item.name}</p>
              <h3 className="text-2xl font-bold">{item.value}</h3>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
