
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { FiPlay, FiPause, FiPower, FiCpu, FiHardDrive } from "react-icons/fi";

interface VmProps {
  vm: {
    id: string;
    name: string;
    status: "running" | "stopped" | "suspended" | "creating" | "error";
    os: string;
    cpu: number;
    ram: number;
    storage: number;
    assignedTo?: string;
  };
}

export const VmCard = ({ vm }: VmProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-green-100 text-green-700 border-green-200";
      case "stopped":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "suspended":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "creating":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "error":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running":
        return <FiPlay size={14} className="mr-1" />;
      case "stopped":
        return <FiPower size={14} className="mr-1" />;
      case "suspended":
        return <FiPause size={14} className="mr-1" />;
      default:
        return null;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-lg truncate">{vm.name}</h3>
          <Badge 
            variant="outline" 
            className={`${getStatusColor(vm.status)} flex items-center font-normal`}
          >
            {getStatusIcon(vm.status)}
            <span className="capitalize">{vm.status}</span>
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-3">{vm.os}</p>
        
        <div className="flex flex-wrap gap-3 text-xs">
          <Tooltip>
            <TooltipTrigger>
              <div className="inline-flex items-center text-slate-700">
                <FiCpu size={14} className="mr-1" />
                <span>{vm.cpu} CPU</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Virtual CPUs allocated</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger>
              <div className="inline-flex items-center text-slate-700">
                <FiHardDrive size={14} className="mr-1" />
                <span>{vm.ram} GB RAM</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Memory allocated</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger>
              <div className="inline-flex items-center text-slate-700">
                <FiHardDrive size={14} className="mr-1" />
                <span>{vm.storage} GB</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Storage capacity</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardContent>

      {vm.assignedTo && (
        <CardFooter className="px-4 py-2 bg-slate-50 text-xs text-slate-500">
          Assigned to: {vm.assignedTo}
        </CardFooter>
      )}
    </Card>
  );
};
