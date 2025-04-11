
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Network as NetworkIcon, 
  Globe, 
  Wifi, 
  Lock, 
  Shield, 
  AlertTriangle,
  Activity,
  RefreshCw,
  Radio,
  Router
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

interface NetworkInterface {
  id: string;
  name: string;
  ip: string;
  subnet: string;
  mac: string;
  status: 'active' | 'inactive';
  type: 'ethernet' | 'wifi' | 'vpn';
  speed: string;
}

interface FirewallRule {
  id: string;
  name: string;
  source: string;
  destination: string;
  port: string;
  protocol: 'TCP' | 'UDP' | 'ICMP';
  action: 'allow' | 'deny';
  enabled: boolean;
}

interface VPNConnection {
  id: string;
  name: string;
  server: string;
  protocol: string;
  status: 'connected' | 'disconnected';
  lastConnected: string;
  users: number;
}

const networkTrafficData = [
  { time: '00:00', inbound: 20, outbound: 24 },
  { time: '01:00', inbound: 15, outbound: 18 },
  { time: '02:00', inbound: 10, outbound: 12 },
  { time: '03:00', inbound: 5, outbound: 8 },
  { time: '04:00', inbound: 8, outbound: 10 },
  { time: '05:00', inbound: 12, outbound: 15 },
  { time: '06:00', inbound: 25, outbound: 30 },
  { time: '07:00', inbound: 45, outbound: 50 },
  { time: '08:00', inbound: 80, outbound: 90 },
  { time: '09:00', inbound: 110, outbound: 120 },
  { time: '10:00', inbound: 90, outbound: 100 },
  { time: '11:00', inbound: 85, outbound: 95 },
  { time: '12:00', inbound: 100, outbound: 110 },
  { time: '13:00', inbound: 110, outbound: 120 },
  { time: '14:00', inbound: 120, outbound: 130 },
  { time: '15:00', inbound: 130, outbound: 140 },
  { time: '16:00', inbound: 120, outbound: 130 },
  { time: '17:00', inbound: 105, outbound: 115 },
  { time: '18:00', inbound: 95, outbound: 105 },
  { time: '19:00', inbound: 80, outbound: 90 },
  { time: '20:00', inbound: 70, outbound: 75 },
  { time: '21:00', inbound: 60, outbound: 65 },
  { time: '22:00', inbound: 50, outbound: 55 },
  { time: '23:00', inbound: 30, outbound: 35 },
  { time: 'Now', inbound: 25, outbound: 30 },
];

const initialInterfaces: NetworkInterface[] = [
  {
    id: 'if1',
    name: 'eth0',
    ip: '192.168.1.1',
    subnet: '255.255.255.0',
    mac: '00:1A:2B:3C:4D:5E',
    status: 'active',
    type: 'ethernet',
    speed: '1 Gbps',
  },
  {
    id: 'if2',
    name: 'eth1',
    ip: '10.0.0.1',
    subnet: '255.255.0.0',
    mac: '00:1A:2B:3C:4D:5F',
    status: 'active',
    type: 'ethernet',
    speed: '10 Gbps',
  },
  {
    id: 'if3',
    name: 'wlan0',
    ip: '192.168.2.1',
    subnet: '255.255.255.0',
    mac: '00:1A:2B:3C:4D:60',
    status: 'active',
    type: 'wifi',
    speed: '300 Mbps',
  },
  {
    id: 'if4',
    name: 'tun0',
    ip: '10.8.0.1',
    subnet: '255.255.255.0',
    mac: 'N/A',
    status: 'active',
    type: 'vpn',
    speed: '100 Mbps',
  },
];

const initialFirewallRules: FirewallRule[] = [
  {
    id: 'fr1',
    name: 'Allow SSH',
    source: 'Any',
    destination: 'Internal',
    port: '22',
    protocol: 'TCP',
    action: 'allow',
    enabled: true,
  },
  {
    id: 'fr2',
    name: 'Block Telnet',
    source: 'Any',
    destination: 'Any',
    port: '23',
    protocol: 'TCP',
    action: 'deny',
    enabled: true,
  },
  {
    id: 'fr3',
    name: 'Allow HTTP/HTTPS',
    source: 'Any',
    destination: 'Internal',
    port: '80,443',
    protocol: 'TCP',
    action: 'allow',
    enabled: true,
  },
  {
    id: 'fr4',
    name: 'Allow DNS',
    source: 'Internal',
    destination: 'Any',
    port: '53',
    protocol: 'UDP',
    action: 'allow',
    enabled: true,
  },
];

const initialVPNs: VPNConnection[] = [
  {
    id: 'vpn1',
    name: 'Main Office VPN',
    server: 'vpn.example.com',
    protocol: 'OpenVPN',
    status: 'connected',
    lastConnected: '2023-04-10 08:15:22',
    users: 24,
  },
  {
    id: 'vpn2',
    name: 'Remote Access VPN',
    server: 'access.example.com',
    protocol: 'WireGuard',
    status: 'connected',
    lastConnected: '2023-04-10 09:30:45',
    users: 37,
  },
  {
    id: 'vpn3',
    name: 'Development VPN',
    server: 'dev-vpn.example.com',
    protocol: 'IPSec',
    status: 'disconnected',
    lastConnected: '2023-04-09 18:22:10',
    users: 0,
  },
];

const Network: React.FC = () => {
  const [interfaces, setInterfaces] = useState<NetworkInterface[]>(initialInterfaces);
  const [firewallRules, setFirewallRules] = useState<FirewallRule[]>(initialFirewallRules);
  const [vpns, setVPNs] = useState<VPNConnection[]>(initialVPNs);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('interfaces');

  const totalInterfaces = interfaces.length;
  const activeInterfaces = interfaces.filter(intf => intf.status === 'active').length;

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate fetching network data
    setTimeout(() => {
      setRefreshing(false);
      toast('Network Status Refreshed', {
        description: 'Network information has been updated successfully.'
      });
    }, 1500);
  };

  const toggleFirewallRule = (ruleId: string) => {
    setFirewallRules(prevRules =>
      prevRules.map(rule =>
        rule.id === ruleId
          ? { ...rule, enabled: !rule.enabled }
          : rule
      )
    );

    const rule = firewallRules.find(r => r.id === ruleId);
    if (rule) {
      toast(`Firewall Rule ${rule.enabled ? 'Disabled' : 'Enabled'}`, {
        description: `Rule "${rule.name}" has been ${rule.enabled ? 'disabled' : 'enabled'}.`
      });
    }
  };

  const toggleVPN = (vpnId: string) => {
    setVPNs(prevVPNs =>
      prevVPNs.map(vpn =>
        vpn.id === vpnId
          ? { 
              ...vpn, 
              status: vpn.status === 'connected' ? 'disconnected' : 'connected',
              lastConnected: vpn.status === 'disconnected' ? new Date().toISOString() : vpn.lastConnected,
              users: vpn.status === 'disconnected' ? Math.floor(Math.random() * 20) + 1 : 0
            }
          : vpn
      )
    );

    const vpn = vpns.find(v => v.id === vpnId);
    if (vpn) {
      toast(`VPN ${vpn.status === 'connected' ? 'Disconnected' : 'Connected'}`, {
        description: `${vpn.name} has been ${vpn.status === 'connected' ? 'disconnected' : 'connected'} successfully.`
      });
    }
  };

  return (
    <DashboardLayout title="Network Management" userType="admin">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Network Configuration</h2>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
        </div>

        {/* Network Status Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-700">
                  <NetworkIcon size={24} />
                </div>
                <h3 className="mt-2 font-medium">Network Interfaces</h3>
                <p className="text-2xl font-bold">{activeInterfaces}/{totalInterfaces}</p>
                <p className="text-sm text-muted-foreground">Interfaces active</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-full bg-green-100 text-green-700">
                  <Activity size={24} />
                </div>
                <h3 className="mt-2 font-medium">Current Traffic</h3>
                <p className="text-2xl font-bold">155 Mbps</p>
                <p className="text-sm text-muted-foreground">25 in / 30 out</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-700">
                  <Globe size={24} />
                </div>
                <h3 className="mt-2 font-medium">Public IP</h3>
                <p className="text-lg font-bold">203.0.113.10</p>
                <p className="text-sm text-muted-foreground">AS12345 ExampleNet</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center">
                <div className="p-3 rounded-full bg-amber-100 text-amber-700">
                  <Shield size={24} />
                </div>
                <h3 className="mt-2 font-medium">Firewall Status</h3>
                <p className="text-xl font-bold">Active</p>
                <p className="text-sm text-muted-foreground">{firewallRules.length} rules configured</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Traffic Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Network Traffic (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={networkTrafficData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorInbound" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorOutbound" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" />
                  <YAxis />
                  <RechartsTooltip />
                  <Area
                    type="monotone"
                    dataKey="inbound"
                    name="Inbound (Mbps)"
                    stroke="#0ea5e9"
                    fillOpacity={1}
                    fill="url(#colorInbound)"
                  />
                  <Area
                    type="monotone"
                    dataKey="outbound"
                    name="Outbound (Mbps)"
                    stroke="#f43f5e"
                    fillOpacity={1}
                    fill="url(#colorOutbound)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Network Management Tabs */}
        <Tabs defaultValue="interfaces" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="interfaces" className="flex items-center">
              <Router size={16} className="mr-2" />
              Interfaces
            </TabsTrigger>
            <TabsTrigger value="firewall" className="flex items-center">
              <Shield size={16} className="mr-2" />
              Firewall
            </TabsTrigger>
            <TabsTrigger value="vpn" className="flex items-center">
              <Lock size={16} className="mr-2" />
              VPN
            </TabsTrigger>
          </TabsList>
          
          {/* Network Interfaces Tab */}
          <TabsContent value="interfaces">
            <Card>
              <CardHeader>
                <CardTitle>Network Interfaces</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Subnet</TableHead>
                      <TableHead>MAC</TableHead>
                      <TableHead>Speed</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {interfaces.map(intf => (
                      <TableRow key={intf.id}>
                        <TableCell className="font-medium">{intf.name}</TableCell>
                        <TableCell>
                          {intf.type === 'ethernet' ? <Router size={16} /> : 
                           intf.type === 'wifi' ? <Wifi size={16} /> : 
                           <Globe size={16} />}
                          {' '}
                          {intf.type.charAt(0).toUpperCase() + intf.type.slice(1)}
                        </TableCell>
                        <TableCell>{intf.ip}</TableCell>
                        <TableCell>{intf.subnet}</TableCell>
                        <TableCell>
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {intf.mac}
                          </code>
                        </TableCell>
                        <TableCell>{intf.speed}</TableCell>
                        <TableCell>
                          <Badge className={intf.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {intf.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Firewall Tab */}
          <TabsContent value="firewall">
            <Card>
              <CardHeader>
                <CardTitle>Firewall Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rule Name</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Port</TableHead>
                      <TableHead>Protocol</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Toggle</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {firewallRules.map(rule => (
                      <TableRow key={rule.id}>
                        <TableCell className="font-medium">{rule.name}</TableCell>
                        <TableCell>{rule.source}</TableCell>
                        <TableCell>{rule.destination}</TableCell>
                        <TableCell>{rule.port}</TableCell>
                        <TableCell>{rule.protocol}</TableCell>
                        <TableCell>
                          <Badge className={rule.action === 'allow' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {rule.action}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={rule.enabled ? "default" : "outline"}>
                            {rule.enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => toggleFirewallRule(rule.id)}
                          >
                            {rule.enabled ? 'Disable' : 'Enable'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* VPN Tab */}
          <TabsContent value="vpn">
            <Card>
              <CardHeader>
                <CardTitle>VPN Connections</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Server</TableHead>
                      <TableHead>Protocol</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Active Users</TableHead>
                      <TableHead>Last Connected</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vpns.map(vpn => (
                      <TableRow key={vpn.id}>
                        <TableCell className="font-medium">{vpn.name}</TableCell>
                        <TableCell>{vpn.server}</TableCell>
                        <TableCell>{vpn.protocol}</TableCell>
                        <TableCell>
                          <Badge className={vpn.status === 'connected' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}>
                            {vpn.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{vpn.users}</TableCell>
                        <TableCell>{vpn.lastConnected}</TableCell>
                        <TableCell>
                          <Button 
                            variant={vpn.status === 'connected' ? 'destructive' : 'default'} 
                            size="sm"
                            onClick={() => toggleVPN(vpn.id)}
                          >
                            {vpn.status === 'connected' ? 'Disconnect' : 'Connect'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Network;
