
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Mock Libvirt calls for demonstration - these would be replaced with actual Libvirt API calls
const libvirtMock = {
  listVMs: async () => {
    return [
      { id: 'vm-001', name: 'mock-vm-1', status: 'running' },
      { id: 'vm-002', name: 'mock-vm-2', status: 'stopped' },
    ];
  },

  getVMStatus: async (vmId: string) => {
    const statuses = ['running', 'stopped', 'suspended'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  },

  startVM: async (vmId: string) => {
    console.log(`Starting VM ${vmId}`);
    return { success: true, vmId, action: 'start' };
  },

  stopVM: async (vmId: string) => {
    console.log(`Stopping VM ${vmId}`);
    return { success: true, vmId, action: 'stop' };
  },

  suspendVM: async (vmId: string) => {
    console.log(`Suspending VM ${vmId}`);
    return { success: true, vmId, action: 'suspend' };
  },

  createVM: async (options: any) => {
    console.log(`Creating VM with options:`, options);
    return { 
      success: true, 
      vmId: `vm-${Date.now()}`, 
      name: options.name, 
      status: 'creating' 
    };
  },

  deleteVM: async (vmId: string) => {
    console.log(`Deleting VM ${vmId}`);
    return { success: true, vmId, action: 'delete' };
  },

  getVMInfo: async (vmId: string) => {
    console.log(`Getting VM info for ${vmId}`);
    return {
      id: vmId,
      name: `VM-${vmId}`,
      status: 'running',
      cpuUsage: Math.random() * 100,
      ramUsage: Math.random() * 100,
      storageUsage: Math.random() * 100,
    };
  }
};

// Handler function
const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();
    const { data: authData, error: authError } = await supabase.auth.getUser(
      req.headers.get('Authorization')?.split(' ')[1] || ''
    );
    
    if (authError || !authData.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    const userId = authData.user.id;

    // Get user role from database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();
    
    if (userError) {
      return new Response(JSON.stringify({ error: 'Error fetching user data' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const userRole = userData.role;
    const body = await req.json();
    let result;

    switch(action) {
      case 'list':
        // For demonstration, we're using mock data
        // In a real implementation, we would connect to the Libvirt API
        // and then map the results to our database structure
        const { data: vms, error: vmError } = await supabase
          .from('virtual_machines')
          .select('*');
          
        if (vmError) {
          return new Response(JSON.stringify({ error: 'Error fetching VMs' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Fetch real-time status from Libvirt (mocked here)
        // In a real implementation, we would make a Libvirt API call for each VM
        result = vms;
        break;

      case 'start':
        if (!body.id) {
          return new Response(JSON.stringify({ error: 'VM ID is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // In a real implementation, we would call the Libvirt API to start the VM
        result = await libvirtMock.startVM(body.id);

        // Update VM status in database
        await supabase
          .from('virtual_machines')
          .update({ status: 'running', last_updated: new Date().toISOString() })
          .eq('id', body.id);
        
        break;

      case 'stop':
        if (!body.id) {
          return new Response(JSON.stringify({ error: 'VM ID is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // In a real implementation, we would call the Libvirt API to stop the VM
        result = await libvirtMock.stopVM(body.id);

        // Update VM status in database
        await supabase
          .from('virtual_machines')
          .update({ status: 'stopped', last_updated: new Date().toISOString() })
          .eq('id', body.id);
        
        break;

      case 'suspend':
        if (!body.id) {
          return new Response(JSON.stringify({ error: 'VM ID is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // In a real implementation, we would call the Libvirt API to suspend the VM
        result = await libvirtMock.suspendVM(body.id);

        // Update VM status in database
        await supabase
          .from('virtual_machines')
          .update({ status: 'suspended', last_updated: new Date().toISOString() })
          .eq('id', body.id);
        
        break;

      case 'create':
        if (!body.name || !body.os || !body.cpu || !body.ram || !body.storage) {
          return new Response(JSON.stringify({ error: 'Missing required VM parameters' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Check if user can create VM (admin or for themselves)
        if (userRole !== 'admin' && body.user_id !== userId) {
          return new Response(JSON.stringify({ error: 'Not authorized to create VM for another user' }), {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // In a real implementation, we would call the Libvirt API to create the VM
        const createResult = await libvirtMock.createVM({
          name: body.name,
          os: body.os,
          cpu: body.cpu,
          ram: body.ram,
          storage: body.storage,
        });

        // Insert new VM to database
        const { data: newVM, error: createError } = await supabase
          .from('virtual_machines')
          .insert({
            name: body.name,
            os: body.os,
            status: 'creating',
            cpu: body.cpu,
            ram: body.ram,
            storage: body.storage,
            course: body.course || null,
            user_id: body.user_id || userId,
            created_at: new Date().toISOString(),
            last_updated: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          return new Response(JSON.stringify({ error: 'Error creating VM in database' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // In a real implementation, we would update the VM with information from the Libvirt API
        // For now we'll simulate a VM creation process
        setTimeout(async () => {
          await supabase
            .from('virtual_machines')
            .update({ 
              status: 'running',
              ip: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
              last_updated: new Date().toISOString() 
            })
            .eq('id', newVM.id);
        }, 5000);
        
        result = newVM;
        break;

      case 'delete':
        if (!body.id) {
          return new Response(JSON.stringify({ error: 'VM ID is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Check if user can delete VM (admin or owner)
        if (userRole !== 'admin') {
          const { data: vmToDelete } = await supabase
            .from('virtual_machines')
            .select('user_id')
            .eq('id', body.id)
            .single();
            
          if (!vmToDelete || vmToDelete.user_id !== userId) {
            return new Response(JSON.stringify({ error: 'Not authorized to delete this VM' }), {
              status: 403,
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
        }

        // In a real implementation, we would call the Libvirt API to delete the VM
        result = await libvirtMock.deleteVM(body.id);

        // Delete VM from database
        await supabase
          .from('virtual_machines')
          .delete()
          .eq('id', body.id);
        
        break;

      case 'stats':
        if (!body.id) {
          return new Response(JSON.stringify({ error: 'VM ID is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // In a real implementation, we would call the Libvirt API to get VM stats
        const vmInfo = await libvirtMock.getVMInfo(body.id);
        
        // Update resource usage in database for historical tracking
        await supabase
          .from('resources')
          .insert({
            user_id: userId,
            cpu_usage: vmInfo.cpuUsage,
            ram_usage: vmInfo.ramUsage,
            storage_usage: vmInfo.storageUsage,
            timestamp: new Date().toISOString()
          });
          
        result = vmInfo;
        break;
        
      default:
        return new Response(JSON.stringify({ error: 'Invalid action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);
