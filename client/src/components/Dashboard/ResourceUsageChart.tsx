
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Progress } from "@/components/ui/progress";

interface ResourceUsageChartProps {
  cpuUsage: number;
  ramUsage: number;
  storageUsage: number;
}

export const ResourceUsageChart = ({ 
  cpuUsage, 
  ramUsage, 
  storageUsage 
}: ResourceUsageChartProps) => {
  const data = [
    { name: 'CPU', usage: cpuUsage },
    { name: 'RAM', usage: ramUsage },
    { name: 'Storage', usage: storageUsage }
  ];
  
  // Create a list of resource metrics to display below the chart
  const metrics = [
    { name: 'CPU', value: cpuUsage, color: 'bg-blue-500' },
    { name: 'RAM', value: ramUsage, color: 'bg-green-500' },
    { name: 'Storage', value: storageUsage, color: 'bg-amber-500' }
  ];

  return (
    <div className="space-y-4">
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis 
              domain={[0, 100]} 
              axisLine={false} 
              tickLine={false} 
              tickFormatter={(value) => `${value}%`} 
            />
            <Tooltip 
              formatter={(value) => [`${value}%`, 'Usage']} 
              cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }} 
            />
            <Bar 
              dataKey="usage" 
              fill="#3b82f6" 
              radius={[4, 4, 0, 0]} 
              barSize={40} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="space-y-2">
        {metrics.map((metric) => (
          <div key={metric.name} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{metric.name}</span>
              <span className="font-medium">{metric.value}%</span>
            </div>
            <Progress value={metric.value} className={metric.color} />
          </div>
        ))}
      </div>
    </div>
  );
};
