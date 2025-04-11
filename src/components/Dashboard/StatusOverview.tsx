
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Server, 
  Cpu, 
  HardDrive, 
  AlertTriangle, 
  Wifi, 
  Users,
  AlertCircle
} from 'lucide-react';

interface StatusItem {
  id: string;
  name: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: number;
    isPositive: boolean;
  };
  status?: 'normal' | 'warning' | 'critical';
}

interface StatusOverviewProps {
  items: StatusItem[];
  title: string;
}

export const StatusOverview: React.FC<StatusOverviewProps> = ({ items, title }) => {
  const getStatusColor = (status: 'normal' | 'warning' | 'critical' | undefined) => {
    switch (status) {
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-green-500';
    }
  };

  const getChangeColor = (isPositive: boolean) => {
    return isPositive ? 'text-green-500' : 'text-red-500';
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <div 
              key={item.id} 
              className="p-4 border rounded-lg bg-white dark:bg-slate-800 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="p-2 rounded-md bg-slate-100 dark:bg-slate-700">
                  {item.icon}
                </div>
                {item.status && item.status !== 'normal' && (
                  <AlertCircle 
                    size={18} 
                    className={getStatusColor(item.status)} 
                  />
                )}
              </div>
              <h3 className="mt-3 text-sm font-medium text-slate-500">{item.name}</h3>
              <div className="flex items-end justify-between mt-1">
                <p className="text-2xl font-semibold">{item.value}</p>
                {item.change && (
                  <div className={`text-xs font-medium ${getChangeColor(item.change.isPositive)}`}>
                    {item.change.isPositive ? '+' : '-'}{Math.abs(item.change.value)}%
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
