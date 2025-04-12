
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Notification } from '@/types/auth';
import { toast } from 'sonner';

export const useNotifications = (userId: string | undefined) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const fetchUserNotifications = async (userId: string) => {
    if (!userId) return;
    
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);
        
      if (error) {
        throw error;
      }
      
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };
  
  const markNotificationAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        )
      );
      
    } catch (error: any) {
      toast('Failed to mark notification as read', {
        description: error.message,
        style: { backgroundColor: 'rgb(239 68 68)' }
      });
    }
  };
  
  const clearNotifications = () => {
    setNotifications([]);
  };
  
  return {
    notifications,
    fetchUserNotifications,
    markNotificationAsRead,
    clearNotifications
  };
};
