
import React, { useState } from 'react';
import { DashboardLayout } from '@/components/Layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  HardDrive, 
  FileText, 
  Database, 
  Image, 
  Film, 
  Archive, 
  File, 
  Trash2,
  Plus,
  RefreshCw 
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface StorageVolume {
  id: string;
  name: string;
  type: 'SSD' | 'HDD';
  totalSpace: number; // in GB
  usedSpace: number; // in GB
  mountPoint: string;
  status: 'online' | 'degraded' | 'offline';
}

interface StorageType {
  type: string;
  icon: React.ElementType;
  size: number; // in GB
  color: string;
}

const initialVolumes: StorageVolume[] = [
  {
    id: 'vol1',
    name: 'Main Storage',
    type: 'SSD',
    totalSpace: 1000,
    usedSpace: 650,
    mountPoint: '/storage/main',
    status: 'online',
  },
  {
    id: 'vol2',
    name: 'Backup Storage',
    type: 'HDD',
    totalSpace: 2000,
    usedSpace: 1200,
    mountPoint: '/storage/backup',
    status: 'online',
  },
  {
    id: 'vol3',
    name: 'VM Storage',
    type: 'SSD',
    totalSpace: 500,
    usedSpace: 480,
    status: 'degraded',
    mountPoint: '/storage/vm',
  },
  {
    id: 'vol4',
    name: 'Archive Storage',
    type: 'HDD',
    totalSpace: 4000,
    usedSpace: 1500,
    mountPoint: '/storage/archive',
    status: 'online',
  },
];

const storageTypes: StorageType[] = [
  { type: 'Documents', icon: FileText, size: 120, color: 'text-blue-500' },
  { type: 'Database', icon: Database, size: 350, color: 'text-purple-500' },
  { type: 'Images', icon: Image, size: 280, color: 'text-green-500' },
  { type: 'Videos', icon: Film, size: 450, color: 'text-red-500' },
  { type: 'Archives', icon: Archive, size: 210, color: 'text-amber-500' },
  { type: 'Other', icon: File, size: 290, color: 'text-gray-500' },
];

const Storage: React.FC = () => {
  const [volumes, setVolumes] = useState<StorageVolume[]>(initialVolumes);
  const [refreshing, setRefreshing] = useState(false);
  const [newVolumeOpen, setNewVolumeOpen] = useState(false);
  const [newVolumeName, setNewVolumeName] = useState('');
  const [newVolumeType, setNewVolumeType] = useState<'SSD' | 'HDD'>('SSD');
  const [newVolumeSize, setNewVolumeSize] = useState('');
  const [newVolumePath, setNewVolumePath] = useState('');

  const totalSpace = volumes.reduce((acc, vol) => acc + vol.totalSpace, 0);
  const usedSpace = volumes.reduce((acc, vol) => acc + vol.usedSpace, 0);

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate fetching updated storage data
    setTimeout(() => {
      setRefreshing(false);
      toast('Storage Status Refreshed', {
        description: 'Storage information has been updated.'
      });
    }, 1500);
  };

  const handleCreateVolume = () => {
    if (!newVolumeName || !newVolumeSize || !newVolumePath) {
      toast('Validation Error', {
        description: 'Please fill in all required fields.',
        style: { backgroundColor: 'rgb(239 68 68)' },
      });
      return;
    }

    const sizeNum = parseInt(newVolumeSize);
    if (isNaN(sizeNum) || sizeNum <= 0) {
      toast('Validation Error', {
        description: 'Please enter a valid size.',
        style: { backgroundColor: 'rgb(239 68 68)' },
      });
      return;
    }

    const newVolume: StorageVolume = {
      id: `vol${volumes.length + 1}`,
      name: newVolumeName,
      type: newVolumeType,
      totalSpace: sizeNum,
      usedSpace: 0,
      mountPoint: newVolumePath,
      status: 'online',
    };

    setVolumes([...volumes, newVolume]);
    setNewVolumeOpen(false);
    setNewVolumeName('');
    setNewVolumeType('SSD');
    setNewVolumeSize('');
    setNewVolumePath('');

    toast('Volume Created', {
      description: `${newVolumeName} has been created successfully.`
    });
  };

  return (
    <DashboardLayout title="Storage Management" userType="admin">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold">Storage Overview</h2>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Dialog open={newVolumeOpen} onOpenChange={setNewVolumeOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus size={16} className="mr-2" />
                  Add Storage Volume
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Storage Volume</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium">Volume Name</label>
                    <Input 
                      id="name" 
                      value={newVolumeName} 
                      onChange={(e) => setNewVolumeName(e.target.value)}
                      placeholder="e.g., New Storage"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="type" className="text-sm font-medium">Type</label>
                    <div className="flex space-x-2">
                      <Button 
                        variant={newVolumeType === 'SSD' ? "default" : "outline"} 
                        onClick={() => setNewVolumeType('SSD')}
                        className="flex-1"
                      >
                        SSD
                      </Button>
                      <Button 
                        variant={newVolumeType === 'HDD' ? "default" : "outline"} 
                        onClick={() => setNewVolumeType('HDD')}
                        className="flex-1"
                      >
                        HDD
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="size" className="text-sm font-medium">Size (GB)</label>
                    <Input 
                      id="size" 
                      type="number" 
                      value={newVolumeSize} 
                      onChange={(e) => setNewVolumeSize(e.target.value)}
                      placeholder="e.g., 500"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="path" className="text-sm font-medium">Mount Path</label>
                    <Input 
                      id="path" 
                      value={newVolumePath} 
                      onChange={(e) => setNewVolumePath(e.target.value)}
                      placeholder="e.g., /storage/new"
                    />
                  </div>
                  <Button className="w-full" onClick={handleCreateVolume}>
                    Create Volume
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Storage Overview Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Overall Storage Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold">{usedSpace} GB</span>
                  <span className="text-muted-foreground"> of {totalSpace} GB used</span>
                </div>
                <span className="text-lg font-medium">
                  {Math.round((usedSpace / totalSpace) * 100)}%
                </span>
              </div>
              <Progress value={(usedSpace / totalSpace) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Storage By Type */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Storage by Content Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {storageTypes.map((item) => (
              <Card key={item.type} className="shadow-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`mr-4 p-2 rounded-full bg-slate-100 dark:bg-slate-800 ${item.color}`}>
                        <item.icon size={24} />
                      </div>
                      <div>
                        <h4 className="font-medium">{item.type}</h4>
                        <p className="text-sm text-muted-foreground">{item.size} GB</p>
                      </div>
                    </div>
                    <span className="text-sm font-medium">
                      {Math.round((item.size / usedSpace) * 100)}%
                    </span>
                  </div>
                  <Progress value={(item.size / usedSpace) * 100} className="h-1 mt-4" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Alert for Critical Volumes */}
        {volumes.some(vol => vol.status === 'degraded' || (vol.usedSpace / vol.totalSpace > 0.9)) && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Storage Alerts</AlertTitle>
            <AlertDescription>
              Some storage volumes require attention. Check the status below.
            </AlertDescription>
          </Alert>
        )}

        {/* Storage Volumes Table */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Storage Volumes</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Volume Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Mount Point</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {volumes.map((volume) => {
                    const usagePercent = (volume.usedSpace / volume.totalSpace) * 100;
                    const statusColor = 
                      volume.status === 'online' ? 'bg-green-100 text-green-800' :
                      volume.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800';
                    
                    return (
                      <TableRow key={volume.id}>
                        <TableCell>{volume.name}</TableCell>
                        <TableCell>{volume.type}</TableCell>
                        <TableCell>
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                            {volume.mountPoint}
                          </code>
                        </TableCell>
                        <TableCell>{volume.totalSpace} GB</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Progress 
                              value={usagePercent} 
                              className={`h-2 w-24 mr-2 ${
                                usagePercent > 90 ? 'bg-red-100' : 
                                usagePercent > 75 ? 'bg-yellow-100' : ''
                              }`} 
                            />
                            <span className="text-sm">
                              {volume.usedSpace} GB ({Math.round(usagePercent)}%)
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={statusColor}>
                            {volume.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon">
                            <HardDrive size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-red-500">
                            <Trash2 size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Storage;
