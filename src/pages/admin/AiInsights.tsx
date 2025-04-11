
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { AiPredictionCard } from '@/components/Dashboard/AiPredictionCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Brain,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  BarChart,
  LineChart,
  HelpCircle,
  Sparkles,
  Settings,
  ZapOff,
  Zap
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart as RechartBarChart,
  Bar,
  Cell
} from "recharts";
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

// AI Prediction Data
const cpuPredictionData = [
  { time: 'Now', actual: 60, predicted: 60 },
  { time: '+1h', actual: 0, predicted: 65 },
  { time: '+2h', actual: 0, predicted: 72 },
  { time: '+3h', actual: 0, predicted: 80 },
  { time: '+4h', actual: 0, predicted: 85 },
  { time: '+5h', actual: 0, predicted: 78 },
  { time: '+6h', actual: 0, predicted: 65 },
];

const ramPredictionData = [
  { time: 'Now', actual: 45, predicted: 45 },
  { time: '+1h', actual: 0, predicted: 48 },
  { time: '+2h', actual: 0, predicted: 52 },
  { time: '+3h', actual: 0, predicted: 58 },
  { time: '+4h', actual: 0, predicted: 64 },
  { time: '+5h', actual: 0, predicted: 60 },
  { time: '+6h', actual: 0, predicted: 54 },
];

const storagePredictionData = [
  { time: 'Now', actual: 72, predicted: 72 },
  { time: '+1d', actual: 0, predicted: 74 },
  { time: '+2d', actual: 0, predicted: 76 },
  { time: '+3d', actual: 0, predicted: 79 },
  { time: '+4d', actual: 0, predicted: 81 },
  { time: '+5d', actual: 0, predicted: 84 },
  { time: '+6d', actual: 0, predicted: 87 },
  { time: '+7d', actual: 0, predicted: 90 },
];

// Anomaly Detection Data
const anomalyData = [
  { time: '00:00', value: 23, isAnomaly: false },
  { time: '01:00', value: 25, isAnomaly: false },
  { time: '02:00', value: 22, isAnomaly: false },
  { time: '03:00', value: 20, isAnomaly: false },
  { time: '04:00', value: 24, isAnomaly: false },
  { time: '05:00', value: 28, isAnomaly: false },
  { time: '06:00', value: 35, isAnomaly: false },
  { time: '07:00', value: 50, isAnomaly: false },
  { time: '08:00', value: 65, isAnomaly: false },
  { time: '09:00', value: 98, isAnomaly: true },  // Anomaly
  { time: '10:00', value: 75, isAnomaly: false },
  { time: '11:00', value: 74, isAnomaly: false },
  { time: '12:00', value: 78, isAnomaly: false },
  { time: '13:00', value: 80, isAnomaly: false },
  { time: '14:00', value: 82, isAnomaly: false },
  { time: '15:00', value: 105, isAnomaly: true }, // Anomaly
  { time: '16:00', value: 79, isAnomaly: false },
  { time: '17:00', value: 76, isAnomaly: false },
  { time: '18:00', value: 72, isAnomaly: false },
  { time: '19:00', value: 65, isAnomaly: false },
  { time: '20:00', value: 55, isAnomaly: false },
  { time: '21:00', value: 45, isAnomaly: false },
  { time: '22:00', value: 38, isAnomaly: false },
  { time: '23:00', value: 30, isAnomaly: false },
];

// Cost Optimization Data
const costSavingData = [
  { name: 'Current', value: 3240, color: '#8884d8' },
  { name: 'Optimized', value: 2180, color: '#82ca9d' },
];

const monthlyCostData = [
  { month: 'Jan', cost: 2800 },
  { month: 'Feb', cost: 3100 },
  { month: 'Mar', cost: 3000 },
  { month: 'Apr', cost: 3240 },
  { month: 'May', cost: 2700 }, // Projected with AI optimization
  { month: 'Jun', cost: 2450 }, // Projected with AI optimization
];

// VM Recommendation Data
interface VMRecommendation {
  id: string;
  name: string;
  currentConfig: string;
  recommendedConfig: string;
  savingsPercent: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

const vmRecommendations: VMRecommendation[] = [
  {
    id: 'r1',
    name: 'Web-Server-01',
    currentConfig: '8 CPU, 16 GB RAM',
    recommendedConfig: '4 CPU, 8 GB RAM',
    savingsPercent: 50,
    reason: 'Low CPU utilization (avg 15%) over past 30 days',
    priority: 'high',
  },
  {
    id: 'r2',
    name: 'DB-Server-02',
    currentConfig: '16 CPU, 64 GB RAM',
    recommendedConfig: '16 CPU, 32 GB RAM',
    savingsPercent: 25,
    reason: 'RAM consistently below 45% usage',
    priority: 'medium',
  },
  {
    id: 'r3',
    name: 'Test-Environment',
    currentConfig: 'Running 24/7',
    recommendedConfig: 'Auto-shutdown after 8 hours of inactivity',
    savingsPercent: 65,
    reason: 'Only used during business hours',
    priority: 'high',
  },
  {
    id: 'r4',
    name: 'Dev-Server-03',
    currentConfig: '4 CPU, 8 GB RAM',
    recommendedConfig: '2 CPU, 8 GB RAM',
    savingsPercent: 20,
    reason: 'CPU usage never exceeds 40%',
    priority: 'low',
  },
];

const AiInsights: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [predictionWindow, setPredictionWindow] = useState('6h');
  const [showAllRecommendations, setShowAllRecommendations] = useState(false);

  const displayedRecommendations = showAllRecommendations 
    ? vmRecommendations 
    : vmRecommendations.filter(rec => rec.priority === 'high');

  const handleRefreshInsights = () => {
    setRefreshing(true);
    
    // Simulate API call to refresh AI insights
    setTimeout(() => {
      setRefreshing(false);
      toast('AI Insights Refreshed', {
        description: 'All predictions and recommendations have been updated with the latest data.'
      });
    }, 2000);
  };

  const handleToggleAI = (enabled: boolean) => {
    setAiEnabled(enabled);
    
    toast(enabled ? 'AI Features Enabled' : 'AI Features Disabled', {
      description: enabled 
        ? 'AI-powered insights and recommendations are now active.' 
        : 'AI features have been disabled. Some recommendations will not be available.'
    });
  };

  const handleApplyRecommendation = (recId: string) => {
    const rec = vmRecommendations.find(r => r.id === recId);
    if (rec) {
      toast('Recommendation Applied', {
        description: `${rec.name} will be updated to use ${rec.recommendedConfig}.`
      });
    }
  };

  return (
    <DashboardLayout title="AI Insights" userType="admin">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold flex items-center">
              <Brain size={24} className="mr-2 text-purple-500" />
              AI Insights Dashboard
            </h2>
            <p className="text-muted-foreground">
              AI-powered analytics to optimize VM resource usage and detect anomalies
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-2 mr-4">
              <Switch 
                checked={aiEnabled}
                onCheckedChange={handleToggleAI}
              />
              <span className="text-sm font-medium">
                {aiEnabled ? (
                  <span className="flex items-center text-green-600">
                    <Zap size={16} className="mr-1" />
                    AI Enabled
                  </span>
                ) : (
                  <span className="flex items-center text-gray-500">
                    <ZapOff size={16} className="mr-1" />
                    AI Disabled
                  </span>
                )}
              </span>
            </div>
            <Button onClick={handleRefreshInsights} disabled={refreshing || !aiEnabled}>
              <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Insights
            </Button>
          </div>
        </div>

        {!aiEnabled && (
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
            <CardContent className="pt-6">
              <div className="flex items-start">
                <AlertTriangle className="mr-2 text-amber-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-amber-800 dark:text-amber-300">AI Features Disabled</h3>
                  <p className="text-amber-700 dark:text-amber-400">
                    Enable AI to access predictive insights, anomaly detection, and optimization recommendations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="predictions">
          <TabsList className="grid grid-cols-1 md:grid-cols-3 mb-6">
            <TabsTrigger value="predictions" className="flex items-center" disabled={!aiEnabled}>
              <TrendingUp size={16} className="mr-2" />
              Resource Predictions
            </TabsTrigger>
            <TabsTrigger value="anomalies" className="flex items-center" disabled={!aiEnabled}>
              <AlertTriangle size={16} className="mr-2" />
              Anomaly Detection
            </TabsTrigger>
            <TabsTrigger value="optimization" className="flex items-center" disabled={!aiEnabled}>
              <Sparkles size={16} className="mr-2" />
              Cost Optimization
            </TabsTrigger>
          </TabsList>

          {/* Resource Predictions Tab */}
          <TabsContent value="predictions">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
              <h3 className="text-lg font-medium flex items-center">
                <TrendingUp size={20} className="mr-2 text-blue-500" />
                Resource Usage Predictions
              </h3>
              <div className="flex items-center">
                <span className="mr-2 text-sm">Prediction window:</span>
                <Select 
                  value={predictionWindow}
                  onValueChange={setPredictionWindow}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Window" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3h">3 hours</SelectItem>
                    <SelectItem value="6h">6 hours</SelectItem>
                    <SelectItem value="12h">12 hours</SelectItem>
                    <SelectItem value="24h">24 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <AiPredictionCard
                title="CPU Usage Prediction"
                data={cpuPredictionData}
                resourceType="CPU"
                predictionConfidence={85}
                alertThreshold={80}
              />
              
              <AiPredictionCard
                title="RAM Usage Prediction"
                data={ramPredictionData}
                resourceType="RAM"
                predictionConfidence={82}
                alertThreshold={75}
              />
              
              <AiPredictionCard
                title="Storage Growth (7-day)"
                data={storagePredictionData}
                resourceType="Storage"
                predictionConfidence={90}
                alertThreshold={95}
              />
            </div>

            <Card className="mt-6">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center">
                  <HelpCircle size={18} className="mr-2 text-blue-500" />
                  Interpreting AI Predictions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  AI predictions show anticipated resource usage based on historical patterns and current trends.
                  The system will automatically alert you when predicted values exceed set thresholds, allowing
                  you to take proactive measures before issues occur. Confidence scores indicate the reliability 
                  of each prediction based on available data patterns.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Anomaly Detection Tab */}
          <TabsContent value="anomalies">
            <div className="mb-6">
              <h3 className="text-lg font-medium flex items-center mb-2">
                <AlertTriangle size={20} className="mr-2 text-amber-500" />
                System Anomaly Detection
              </h3>
              <p className="text-muted-foreground">
                AI-powered anomaly detection identifies unusual patterns in system metrics that may indicate issues or security concerns.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Resource Usage Anomalies (24h)</CardTitle>
                  <CardDescription>
                    Unusual spikes or drops in system resource utilization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={anomalyData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="time" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <RechartsTooltip 
                          content={(props) => {
                            const { active, payload } = props;
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-white p-2 border shadow-sm rounded-md text-sm">
                                  <p className="font-medium">{`Time: ${data.time}`}</p>
                                  <p>{`Value: ${data.value}`}</p>
                                  {data.isAnomaly && (
                                    <p className="text-red-600 font-medium">Anomaly Detected</p>
                                  )}
                                </div>
                              );
                            }
                            return null;
                          }} 
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#8884d8"
                          fillOpacity={1}
                          fill="url(#colorValue)"
                        />
                        {anomalyData
                          .filter(item => item.isAnomaly)
                          .map((entry, index) => (
                            <g key={`anomaly-${index}`}>
                              <circle
                                cx={`${anomalyData.findIndex(d => d.time === entry.time) / (anomalyData.length - 1) * 100}%`}
                                cy={`${(1 - entry.value / 120) * 100}%`}
                                r={6}
                                fill="red"
                                stroke="#fff"
                                strokeWidth={2}
                              />
                            </g>
                          ))}
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium text-sm mb-2">Detected Anomalies:</h4>
                    <div className="space-y-2">
                      <div className="flex items-center p-2 bg-red-50 border border-red-100 rounded-md">
                        <AlertTriangle size={16} className="text-red-500 mr-2" />
                        <div>
                          <p className="text-sm font-medium">CPU Spike at 09:00</p>
                          <p className="text-xs text-muted-foreground">98% utilization, 215% above normal pattern</p>
                        </div>
                      </div>
                      <div className="flex items-center p-2 bg-red-50 border border-red-100 rounded-md">
                        <AlertTriangle size={16} className="text-red-500 mr-2" />
                        <div>
                          <p className="text-sm font-medium">CPU Spike at 15:00</p>
                          <p className="text-xs text-muted-foreground">105% utilization, 230% above normal pattern</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Anomaly Summary</CardTitle>
                  <CardDescription>
                    AI analysis of detected anomalies and potential causes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Peak Analysis</h4>
                        <Badge className="bg-amber-100 text-amber-800">2 Anomalies</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        AI has detected 2 significant anomalies in the past 24 hours, both related to 
                        unusual CPU usage spikes. These events occurred at 09:00 and 15:00, with utilization
                        exceeding 95%.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Potential Causes</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Scheduled batch processing job running during peak hours</li>
                        <li>Database query optimization issues on Web-Server-01</li>
                        <li>Possible resource contention between neighboring VMs</li>
                        <li>Unplanned workload spike from external traffic</li>
                      </ul>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Recommended Actions</h4>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        <li>Reschedule batch processes to off-peak hours (after 22:00)</li>
                        <li>Review database query performance on Web-Server-01</li>
                        <li>Consider migrating high-usage VMs to separate hosts</li>
                        <li>Implement automatic scaling for Web-Server-01</li>
                      </ul>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center">
                        <Brain size={16} className="text-purple-500 mr-2" />
                        <span className="text-xs text-muted-foreground">AI Confidence: 87%</span>
                      </div>
                      <Button variant="outline" size="sm">
                        Generate Detailed Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Cost Optimization Tab */}
          <TabsContent value="optimization">
            <div className="mb-6">
              <h3 className="text-lg font-medium flex items-center mb-2">
                <Sparkles size={20} className="mr-2 text-green-500" />
                Cost Optimization Recommendations
              </h3>
              <p className="text-muted-foreground">
                AI-driven recommendations to optimize resource allocation and reduce operational costs.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Estimated Monthly Savings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center h-[180px]">
                    <div className="text-3xl font-bold text-green-600">$1,060</div>
                    <div className="text-muted-foreground">Per Month</div>
                    <div className="flex items-center mt-2 text-sm text-green-600">
                      <ArrowUpRight size={16} className="mr-1" />
                      <span>32.7% savings</span>
                    </div>
                  </div>
                  
                  <div className="h-[160px] mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartBarChart
                        data={costSavingData}
                        margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                      >
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Bar dataKey="value" name="Cost ($)">
                          {costSavingData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </RechartBarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle>Cost Projection (6 months)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={monthlyCostData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <defs>
                          <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <RechartsTooltip />
                        <Area
                          type="monotone"
                          dataKey="cost"
                          name="Monthly Cost ($)"
                          stroke="#8884d8"
                          fillOpacity={1}
                          fill="url(#colorCost)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 flex items-center">
                    <Badge className="bg-blue-100 text-blue-800 mr-2">Historical</Badge>
                    <span className="text-sm text-muted-foreground mr-4">Jan-Apr</span>
                    <Badge className="bg-green-100 text-green-800 mr-2">Projected with AI optimization</Badge>
                    <span className="text-sm text-muted-foreground">May-Jun</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>VM Optimization Recommendations</CardTitle>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAllRecommendations(!showAllRecommendations)}
                  >
                    {showAllRecommendations ? 'Show High Priority Only' : 'Show All Recommendations'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {displayedRecommendations.map(rec => (
                    <Card key={rec.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                          <div>
                            <h4 className="font-medium">{rec.name}</h4>
                            <div className="flex items-center mt-1 text-sm text-muted-foreground">
                              <Badge 
                                variant="outline" 
                                className={
                                  rec.priority === 'high' ? 'border-red-500 text-red-700' :
                                  rec.priority === 'medium' ? 'border-amber-500 text-amber-700' :
                                  'border-blue-500 text-blue-700'
                                }
                              >
                                {rec.priority} priority
                              </Badge>
                              <span className="mx-2">•</span>
                              <span className="flex items-center text-green-600">
                                <ArrowDownRight size={14} className="mr-1" />
                                {rec.savingsPercent}% potential savings
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col md:items-end gap-2">
                            <Button 
                              size="sm" 
                              className="w-full md:w-auto"
                              onClick={() => handleApplyRecommendation(rec.id)}
                            >
                              Apply Recommendation
                            </Button>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Current: </span>
                              <span className="font-medium">{rec.currentConfig}</span>
                              <span className="mx-2">→</span>
                              <span className="text-muted-foreground">Recommended: </span>
                              <span className="font-medium">{rec.recommendedConfig}</span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          <strong>Reason:</strong> {rec.reason}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {aiEnabled && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings size={16} className="mr-2" />
                AI Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label htmlFor="alertThreshold" className="text-sm font-medium">Alert Threshold</label>
                  <Select defaultValue="75">
                    <SelectTrigger>
                      <SelectValue placeholder="Select threshold" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="60">60%</SelectItem>
                      <SelectItem value="75">75%</SelectItem>
                      <SelectItem value="80">80%</SelectItem>
                      <SelectItem value="90">90%</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Percentage at which resources trigger alerts
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="analysisFrequency" className="text-sm font-medium">Analysis Frequency</label>
                  <Select defaultValue="hourly">
                    <SelectTrigger>
                      <SelectValue placeholder="Analysis frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15min">Every 15 minutes</SelectItem>
                      <SelectItem value="30min">Every 30 minutes</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    How often AI analyzes system data
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="modelVersion" className="text-sm font-medium">AI Model Version</label>
                  <Select defaultValue="v3">
                    <SelectTrigger>
                      <SelectValue placeholder="Model version" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="v1">v1 (Standard)</SelectItem>
                      <SelectItem value="v2">v2 (Enhanced)</SelectItem>
                      <SelectItem value="v3">v3 (Advanced)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Select AI model version for analysis
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AiInsights;
