
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

export const NotificationsPopover: React.FC = () => {
  const { notifications, markNotificationAsRead } = useAuth();
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const handleNotificationClick = (id: string) => {
    markNotificationAsRead(id);
  };
  
  const getNotificationColor = (type: string) => {
    switch(type) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-amber-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell size={20} />
          {unreadCount > 0 && (
            <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-[10px]">{unreadCount}</span>
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b border-border">
          <h3 className="font-medium">Notifications</h3>
          <p className="text-sm text-muted-foreground">You have {unreadCount} unread notifications</p>
        </div>
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No notifications
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={cn(
                    "p-4 border-b border-border cursor-pointer transition-colors hover:bg-muted/50",
                    notification.read ? "bg-background" : "bg-muted/20"
                  )}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="flex items-start gap-2">
                    <div className={cn("w-2 h-2 rounded-full mt-2", getNotificationColor(notification.type))} />
                    <div className="flex-1 space-y-1">
                      <p className={cn("text-sm", !notification.read && "font-medium")}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;
