import api from './api';

export interface VM {
  id: string | null;
  name: string;
  state: string;
  status?: "running" | "stopped" | "suspended" | "creating" | "error";
  description?: string;
  ip_address?: string;
  os_type?: string;
  memory?: number;
  vcpus?: number;
  storage?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VMInfo extends VM {
  memory_stats?: Record<string, string>;
  uuid?: string;
  cpu_time?: string;
  max_memory?: string;
  used_memory?: string;
  [key: string]: any;
}

export interface VMOperationResult {
  success: boolean;
  message: string;
  vmName: string;
  vm?: VM;
}

export interface CreateVMPayload {
  name: string;
  memory?: number; // in MB
  vcpus?: number;
  storage?: number; // in GB
  os_type?: string;
  iso_path?: string;
  description?: string;
}

export interface VMRequestPayload {
  purpose: string;
  memory?: number;
  vcpus?: number;
  storage?: number;
  os_type?: string;
  course?: string;
  duration?: string; // e.g., "2 weeks", "1 semester"
  description?: string;
}

export interface VMRequest {
  id: string;
  user_id: string;
  username?: string;
  purpose: string;
  memory?: number;
  vcpus?: number;
  storage?: number;
  os_type?: string;
  course?: string;
  duration?: string;
  description?: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at?: string;
  vm_id?: string;
  response_message?: string;
}

export interface DashboardData {
  stats: {
    totalVms: number;
    runningVms: number;
    storageUsed: number;
    activeUsers: number;
  };
  recentVms: VM[];
  resourceStats: {
    cpu: { used: number; total: number };
    ram: { used: number; total: number };
    storage: { used: number; total: number };
  };
}

export const vmService = {
  /**
   * Get a list of all VMs
   */
  async listVMs(onlyRunning = false): Promise<VM[]> {
    try {
      const response = await api.get(`/vms/list`, {
        params: { onlyRunning }
      });
      
      // Map the raw VM data to our standardized format for the frontend
      return response.data.vms.map((vm: VM) => ({
        ...vm,
        status: this.mapStateToStatus(vm.state)
      }));
    } catch (error) {
      console.error('Error listing VMs:', error);
      // Return empty array to avoid UI errors
      return [];
    }
  },
  
  /**
   * Get admin dashboard data
   */
  async getDashboardData(): Promise<DashboardData> {
    try {
      const response = await api.get(`/vms/dashboard-data`);
      
      // Handle successful response (200 or cached 304)
      const data = response.data;
      
      // Map the raw VM state to status for recent VMs if they exist
      if (data.recentVms && Array.isArray(data.recentVms)) {
        data.recentVms = data.recentVms.map((vm: VM) => ({
          ...vm,
          status: this.mapStateToStatus(vm.state)
        }));
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      
      // Return a default structure that won't cause UI errors
      return {
        stats: {
          totalVms: 0,
          runningVms: 0, 
          storageUsed: 0,
          activeUsers: 0
        },
        recentVms: [],
        resourceStats: {
          cpu: { used: 0, total: 100 },
          ram: { used: 0, total: 64 },
          storage: { used: 0, total: 2 }
        }
      };
    }
  },
  
  /**
   * Get recent VM requests for admin dashboard
   */
  async getRecentVMRequests(): Promise<VMRequest[]> {
    try {
      const response = await api.get(`/vms/recent-requests`);
      return response.data.requests || [];
    } catch (error) {
      console.error('Error fetching recent VM requests:', error);
      return [];
    }
  },
  
  /**
   * Get a list of VMs owned by the current user
   */
  async listMyVMs(onlyRunning = false): Promise<VM[]> {
    try {
      const response = await api.get(`/vms/my-vms`, {
        params: { onlyRunning }
      });
      
      // Map the raw VM data to our standardized format for the frontend
      return response.data.vms.map((vm: VM) => ({
        ...vm,
        status: this.mapStateToStatus(vm.state)
      }));
    } catch (error) {
      // If it's a 304, return empty array since browser will use cached data
      if (error.response && error.response.status === 304) {
        console.log('Using cached my VMs data');
        return [];
      }
      throw error;
    }
  },
  
  /**
   * Create a new VM
   */
  async createVM(vmData: CreateVMPayload): Promise<VMOperationResult> {
    const response = await api.post(`/vms/create`, vmData);
    return response.data;
  },
  
  /**
   * Get detailed info for a VM
   */
  async getVMInfo(vmName: string): Promise<VMInfo> {
    const response = await api.get(`/vms/${vmName}`);
    const vmInfo = response.data.vm;
    
    return {
      ...vmInfo,
      status: this.mapStateToStatus(vmInfo.state)
    };
  },
  
  /**
   * Start a VM
   */
  async startVM(vmName: string): Promise<VMOperationResult> {
    const response = await api.post(`/vms/start/${vmName}`);
    return response.data;
  },
  
  /**
   * Stop a VM forcefully
   */
  async stopVM(vmName: string): Promise<VMOperationResult> {
    const response = await api.post(`/vms/stop/${vmName}`);
    return response.data;
  },
  
  /**
   * Shutdown a VM gracefully
   */
  async shutdownVM(vmName: string): Promise<VMOperationResult> {
    const response = await api.post(`/vms/shutdown/${vmName}`);
    return response.data;
  },
  
  /**
   * Restart a VM
   */
  async restartVM(vmName: string): Promise<VMOperationResult> {
    const response = await api.post(`/vms/restart/${vmName}`);
    return response.data;
  },
  
  /**
   * Delete a VM
   */
  async deleteVM(vmName: string, removeStorage = false): Promise<VMOperationResult> {
    const response = await api.delete(`/vms/${vmName}`, {
      params: { removeStorage }
    });
    return response.data;
  },
  
  /**
   * Suspend a VM
   */
  async suspendVM(vmName: string): Promise<VMOperationResult> {
    const response = await api.post(`/vms/suspend/${vmName}`);
    return response.data;
  },
  
  /**
   * Resume a VM
   */
  async resumeVM(vmName: string): Promise<VMOperationResult> {
    const response = await api.post(`/vms/resume/${vmName}`);
    return response.data;
  },
  
  /**
   * Update VM details
   */
  async updateVM(vmName: string, vmData: Partial<VM>): Promise<VMOperationResult> {
    const response = await api.put(`/vms/${vmName}`, vmData);
    return response.data;
  },
  
  /**
   * Create a VM request
   */
  async requestVM(request: VMRequestPayload): Promise<{ success: boolean; message: string; requestId?: string }> {
    const response = await api.post('/vms/request', request);
    return response.data;
  },

  /**
   * Get all VM requests (admin only)
   */
  async getAllVMRequests(): Promise<VMRequest[]> {
    const response = await api.get('/vms/requests');
    return response.data.requests;
  },

  /**
   * Get my VM requests (for students/instructors)
   */
  async getMyVMRequests(): Promise<VMRequest[]> {
    try {
      const response = await api.get('/vms/my-requests');
      return response.data.requests;
    } catch (error) {
      // If it's a 304, return empty array since browser will use cached data
      if (error.response && error.response.status === 304) {
        console.log('Using cached my requests data');
        return [];
      }
      throw error;
    }
  },

  /**
   * Approve a VM request (admin only)
   */
  async approveVMRequest(requestId: string, vmConfig?: CreateVMPayload): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/vms/request/${requestId}/approve`, vmConfig || {});
    return response.data;
  },

  /**
   * Reject a VM request (admin only)
   */
  async rejectVMRequest(requestId: string, reason: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post(`/vms/request/${requestId}/reject`, { reason });
    return response.data;
  },
  
  /**
   * Map libvirt state to frontend status
   */
  mapStateToStatus(state: string): "running" | "stopped" | "suspended" | "creating" | "error" {
    if (!state) return 'error';
    
    state = state.toLowerCase();
    
    if (state.includes('running')) return 'running';
    if (state.includes('shut off') || state.includes('shutoff') || state === 'stopped') return 'stopped';
    if (state.includes('paused') || state.includes('suspended') || state === 'suspended') return 'suspended';
    if (state.includes('creating') || state.includes('building')) return 'creating';
    return 'error';
  }
};

export default vmService;
