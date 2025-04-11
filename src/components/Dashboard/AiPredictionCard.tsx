
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Brain, AlertTriangle, Info } from 'lucide-react';

interface PredictionData {
  time: string;
  actual: number;
  predicted: number;
}

interface AiPredictionCardProps {
  title: string;
  data: PredictionData[];
  resourceType: 'CPU' | 'RAM' | 'Storage';
  predictionConfidence: number;
  alertThreshold?: number;
}

export const AiPredictionCard: React.FC<AiPredictionCardProps> = ({
  title,
  data,
  resourceType,
  predictionConfidence,
  alertThreshold
}) => {
  // Determine color based on resource type
  const getResourceColor = () => {
    switch (resourceType) {
      case 'CPU': return '#0284c7';
      case 'RAM': return '#10b981';
      case 'Storage': return '#8b5cf6';
    }
  };

  // Determine confidence level status
  const getConfidenceStatus = () => {
    if (predictionConfidence >= 80) return 'High';
    if (predictionConfidence >= 60) return 'Medium';
    return 'Low';
  };

  const getConfidenceColor = () => {
    if (predictionConfidence >= 80) return 'text-green-500';
    if (predictionConfidence >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  // Check if we should show alert
  const shouldShowAlert = () => {
    if (!alertThreshold) return false;
    
    // Find if any predicted value exceeds threshold
    return data.some(item => item.predicted > alertThreshold);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Brain size={18} className="text-vmSystem-blue" />
          {title}
        </CardTitle>
        <div className="flex items-center">
          <span className="text-xs mr-1">Confidence:</span>
          <span className={`text-xs font-medium ${getConfidenceColor()}`}>
            {getConfidenceStatus()} ({predictionConfidence}%)
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {shouldShowAlert() && (
          <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded flex items-center gap-2 text-sm text-yellow-700">
            <AlertTriangle size={16} />
            <span>Predicted {resourceType} usage may exceed threshold ({alertThreshold}%)</span>
          </div>
        )}

        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12 }} 
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }} 
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                formatter={(value: number) => [`${value}%`, '']}
                labelFormatter={(label) => `Time: ${label}`}
                itemStyle={{ color: getResourceColor() }}
              />
              {alertThreshold && (
                <ReferenceLine 
                  y={alertThreshold} 
                  stroke="#ef4444" 
                  strokeDasharray="3 3" 
                  label={{ 
                    value: `Threshold (${alertThreshold}%)`, 
                    position: 'insideBottomRight',
                    fill: '#ef4444',
                    fontSize: 12
                  }} 
                />
              )}
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke={getResourceColor()} 
                strokeWidth={2}
                dot={{ r: 3, fill: getResourceColor() }}
                name={`Actual ${resourceType}`}
              />
              <Line 
                type="monotone" 
                dataKey="predicted" 
                stroke={getResourceColor()} 
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
                name={`Predicted ${resourceType}`}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="flex items-center justify-between mt-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div className="w-3 h-1 bg-slate-400"></div>
              <span>Actual</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-1 bg-slate-400 border-dashed border-t border-t-slate-400"></div>
              <span>Predicted</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Info size={14} />
            <span>LSTM Model</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
