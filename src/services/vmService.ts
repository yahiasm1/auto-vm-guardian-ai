import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/types/supabase';
import { toast } from 'sonner';

export type VirtualMachine = Database['public']['Tables']['virtual_machines']['Row'];
export type VMInsert = Database['public']['Tables']['virtual_machines']['Insert'];
export type VMUpdate = Database['public']['Tables']['virtual_machines']['Update'];

export const vmService = {
  getAllVMs: async () => {
    try {
      const { data, error } = await supabase.functions.invoke('vm-management', {
        body: { action: 'list' },
        method: 'POST'
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting VMs:', error);
      toast.error('Failed to retrieve VM list');
      throw error;
    }
  },
  
  getVMById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('virtual_machines')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting VM by ID:', error);
      toast.error('Failed to retrieve VM information');
      throw error;
    }
  },
  
  getVMsByUserId: async (userId: string) => {
    try {
      // Try first with the RLS approach
      const { data, error } = await supabase
        .from('virtual_machines')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error with RLS approach:', error);
        
        // If there's an error with RLS, try using a function instead
        // This is a fallback - ideally the RLS policies should be fixed
        const { data: functionData, error: functionError } = await supabase.functions.invoke('vm-management', {
          body: { 
            action: 'get_user_vms',
            userId
          },
          method: 'POST'
        });
        
        if (functionError) throw functionError;
        return functionData || [];
      }
      
      return data;
    } catch (error) {
      console.error('Error getting user VMs:', error);
      toast.error('Failed to retrieve your VMs');
      
      // For development/demo purposes, return sample VMs when in error state
      // This allows the UI to still function while backend issues are resolved
      if (process.env.NODE_ENV !== 'production') {
        console.log('Returning sample VM data for development');
        return [
          {
            id: 'dev-vm-1',
            name: 'Development VM 1',
            os: 'Ubuntu 22.04 LTS',
            status: 'running',
            cpu: 2,
            ram: 4,
            storage: 50,
            ip: '192.168.1.120',
            user_id: userId,
            created_at: new Date().toISOString(),
            last_updated: new Date().toISOString()
          },
          {
            id: 'dev-vm-2',
            name: 'Development VM 2',
            os: 'Windows Server 2022',
            status: 'stopped',
            cpu: 4,
            ram: 8,
            storage: 100,
            ip: '192.168.1.121',
            user_id: userId,
            created_at: new Date().toISOString(),
            last_updated: new Date().toISOString()
          }
        ];
      }
      
      throw error;
    }
  },
  
  createVM: async (vm: VMInsert) => {
    try {
      toast.loading('Creating VM...');
      
      const { data, error } = await supabase.functions.invoke('vm-management', {
        body: {
          action: 'create',
          ...vm
        },
        method: 'POST'
      });
      
      if (error) throw error;
      
      toast.success('VM creation initiated', {
        description: 'Your VM is being set up. This may take a few minutes.'
      });
      
      return data;
    } catch (error) {
      console.error('Error creating VM:', error);
      toast.error('Failed to create VM');
      throw error;
    }
  },
  
  updateVM: async (id: string, updates: VMUpdate) => {
    try {
      // For simple metadata updates that don't affect the VM state
      const { data, error } = await supabase
        .from('virtual_machines')
        .update({
          ...updates,
          last_updated: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      toast.success('VM updated successfully');
      return data;
    } catch (error) {
      console.error('Error updating VM:', error);
      toast.error('Failed to update VM');
      throw error;
    }
  },
  
  deleteVM: async (id: string) => {
    try {
      toast.loading('Deleting VM...');
      
      const { data, error } = await supabase.functions.invoke('vm-management', {
        body: {
          action: 'delete',
          id
        },
        method: 'POST'
      });
      
      if (error) throw error;
      
      toast.success('VM deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting VM:', error);
      toast.error('Failed to delete VM');
      throw error;
    }
  },
  
  startVM: async (id: string) => {
    try {
      toast.loading('Starting VM...');
      
      const { data, error } = await supabase.functions.invoke('vm-management', {
        body: {
          action: 'start',
          id
        },
        method: 'POST'
      });
      
      if (error) throw error;
      
      toast.success('VM started successfully');
      return data;
    } catch (error) {
      console.error('Error starting VM:', error);
      toast.error('Failed to start VM');
      throw error;
    }
  },
  
  stopVM: async (id: string) => {
    try {
      toast.loading('Stopping VM...');
      
      const { data, error } = await supabase.functions.invoke('vm-management', {
        body: {
          action: 'stop',
          id
        },
        method: 'POST'
      });
      
      if (error) throw error;
      
      toast.success('VM stopped successfully');
      return data;
    } catch (error) {
      console.error('Error stopping VM:', error);
      toast.error('Failed to stop VM');
      throw error;
    }
  },
  
  suspendVM: async (id: string) => {
    try {
      toast.loading('Suspending VM...');
      
      const { data, error } = await supabase.functions.invoke('vm-management', {
        body: {
          action: 'suspend',
          id
        },
        method: 'POST'
      });
      
      if (error) throw error;
      
      toast.success('VM suspended successfully');
      return data;
    } catch (error) {
      console.error('Error suspending VM:', error);
      toast.error('Failed to suspend VM');
      throw error;
    }
  },
  
  getVMStats: async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('vm-management', {
        body: {
          action: 'stats',
          id
        },
        method: 'POST'
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching VM stats:', error);
      // Do not show toast for stats since this might be called frequently
      throw error;
    }
  },
  
  getVMsByCourse: async (course: string) => {
    try {
      const { data, error } = await supabase
        .from('virtual_machines')
        .select('*')
        .eq('course', course)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting course VMs:', error);
      toast.error('Failed to retrieve course VMs');
      throw error;
    }
  },
  
  getVMHistory: async (vmId: string) => {
    try {
      const { data, error } = await supabase
        .from('vm_status_history')
        .select('*, users(name)')
        .eq('vm_id', vmId)
        .order('changed_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching VM history:', error);
      toast.error('Failed to fetch VM history');
      throw error;
    }
  },
  
  getVMTemplates: async () => {
    try {
      const { data, error } = await supabase
        .from('vm_templates')
        .select('*')
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error getting VM templates:', error);
      toast.error('Failed to retrieve VM templates');
      throw error;
    }
  }
};
