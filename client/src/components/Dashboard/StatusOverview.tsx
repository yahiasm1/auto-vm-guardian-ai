
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ServerIcon, VMIcon, StorageIcon, UserIcon } from "@/lib/icons";

interface StatusOverviewProps {
  stats: {
    totalVms: number;
    runningVms: number;
    storageUsed: number;
    activeUsers: number;
  };
}

export const StatusOverview = ({ stats }: StatusOverviewProps) => {
  const statItems = [
    {
      name: "Total VMs",
      value: stats.totalVms,
      icon: <VMIcon size={18} />,
      className: "bg-blue-50 text-blue-600",
    },
    {
      name: "Running VMs",
      value: stats.runningVms,
      icon: <ServerIcon size={18} />,
      className: "bg-green-50 text-green-600",
    },
    {
      name: "Storage Used",
      value: `${stats.storageUsed} TB`,
      icon: <StorageIcon size={18} />,
      className: "bg-purple-50 text-purple-600",
    },
    {
      name: "Active Users",
      value: stats.activeUsers,
      icon: <UserIcon size={18} />,
      className: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
