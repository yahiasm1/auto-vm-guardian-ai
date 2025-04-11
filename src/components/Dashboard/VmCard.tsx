
import React, { useState } from 'react';
import { Server, Power, Pause, Play, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { vmService } from '@/services/vmService';
import { toast } from 'sonner';

export type VMStatus = 'running' | 'stopped' | 'suspended' | 'creating' | 'error';

interface VmCardProps {
  id: string;
  name: string;
  status: VMStatus;
  os: string;
  cpu: number;
  ram: number;
  storage: number;
  ip?: string; // Make ip optional so it can be undefined for VMs in 'creating' status
  isStudent?: boolean;
  onStatusChange?: () => void; // Callback for parent components to refresh data
  onConnect?: (id: string) => void; // Updated to pass the VM ID
}

export const VmCard: React.FC<VmCardProps> = ({
  id,
  name,
  status,
  os,
  cpu,
  ram,
  storage,
  ip,
  isStudent = false,
  onStatusChange,
  onConnect
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const getStatusColor = (status: VMStatus) => {
    switch(status) {
      case 'running': return 'bg-vm-running';
      case 'stopped': return 'bg-vm-stopped';
      case 'suspended': return 'bg-vm-suspended';
      case 'creating': return 'bg-vm-creating';
      case 'error': return 'bg-vm-error';
    }
  };

  const getStatusText = (status: VMStatus) => {
    switch(status) {
      case 'running': return 'Running';
      case 'stopped': return 'Stopped';
      case 'suspended': return 'Suspended';
      case 'creating': return 'Creating...';
      case 'error': return 'Error';
    }
  };
  
  const handleAction = async (action: string) => {
    try {
      setIsLoading(true);
      
      switch (action) {
        case 'Start':
          await vmService.startVM(id);
          break;
        case 'Stop':
          await vmService.stopVM(id);
          break;
        case 'Suspend':
          await vmService.suspendVM(id);
          break;
        case 'Delete':
          await vmService.deleteVM(id);
          break;
        case 'Connect':
          if (onConnect) {
            onConnect(id); // Pass the VM ID to the parent component
          } else {
            toast.info(`Connecting to VM: ${name}`);
            console.log(`Connecting to VM: ${id}`);
          }
          break;
        default:
          break;
      }
      
      if (onStatusChange && action !== 'Connect') {
        onStatusChange();
      }
    } catch (error) {
      console.error(`Error with ${action} operation:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg">
            <Server size={18} className="text-vmSystem-blue" />
            {name}
          </div>
          <div className="flex items-center gap-1">
            <span className={`inline-block w-2 h-2 rounded-full ${getStatusColor(status)} ${status === 'running' ? 'animate-live' : ''}`}></span>
            <span className="text-xs text-slate-500">{getStatusText(status)}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          <div>
            <p className="text-slate-500">OS</p>
            <p className="font-medium">{os}</p>
          </div>
          <div>
            <p className="text-slate-500">IP Address</p>
            <p className="font-medium">{ip || 'Not assigned'}</p>
          </div>
          <div>
            <p className="text-slate-500">CPU / RAM</p>
            <p className="font-medium">{cpu} vCPUs / {ram} GB</p>
          </div>
          <div>
            <p className="text-slate-500">Storage</p>
            <p className="font-medium">{storage} GB</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <TooltipProvider>
            {status === 'stopped' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleAction('Start')}
                    disabled={isLoading}
                  >
                    <Play size={16} className="mr-1" /> Start
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Start virtual machine</TooltipContent>
              </Tooltip>
            )}

            {status === 'running' && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleAction('Stop')}
                      disabled={isLoading}
                    >
                      <Power size={16} className="mr-1" /> Stop
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Stop virtual machine</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleAction('Suspend')}
                      disabled={isLoading}
                    >
                      <Pause size={16} className="mr-1" /> Suspend
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Suspend virtual machine</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="default" 
                      onClick={() => handleAction('Connect')}
                      disabled={isLoading}
                    >
                      <ExternalLink size={16} className="mr-1" /> Connect
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Connect to virtual machine</TooltipContent>
                </Tooltip>
              </>
            )}

            {!isStudent && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => handleAction('Delete')}
                    disabled={isLoading || status === 'creating'}
                  >
                    <Trash2 size={16} className="mr-1" /> Delete
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete virtual machine</TooltipContent>
              </Tooltip>
            )}
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
};
