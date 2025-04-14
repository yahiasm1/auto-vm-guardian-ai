
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

export const vmService = {
  /**
   * Get a list of all VMs
   */
  async listVMs(onlyRunning = false): Promise<VM[]> {
    const response = await api.get(`/vm/list`, {
      params: { onlyRunning }
    });
    
    // Map the raw VM data to our standardized format for the frontend
    return response.data.vms.map((vm: VM) => ({
      ...vm,
      status: this.mapStateToStatus(vm.state)
    }));
  },
  
  /**
   * Get detailed info for a VM
   */
  async getVMInfo(vmName: string): Promise<VMInfo> {
    const response = await api.get(`/vm/${vmName}`);
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
    const response = await api.post(`/vm/start/${vmName}`);
    return response.data;
  },
  
  /**
   * Stop a VM forcefully
   */
  async stopVM(vmName: string): Promise<VMOperationResult> {
    const response = await api.post(`/vm/stop/${vmName}`);
    return response.data;
  },
  
  /**
   * Shutdown a VM gracefully
   */
  async shutdownVM(vmName: string): Promise<VMOperationResult> {
    const response = await api.post(`/vm/shutdown/${vmName}`);
    return response.data;
  },
  
  /**
   * Restart a VM
   */
  async restartVM(vmName: string): Promise<VMOperationResult> {
    const response = await api.post(`/vm/restart/${vmName}`);
    return response.data;
  },
  
  /**
   * Delete a VM
   */
  async deleteVM(vmName: string, removeStorage = false): Promise<VMOperationResult> {
    const response = await api.delete(`/vm/${vmName}`, {
      params: { removeStorage }
    });
    return response.data;
  },
  
  /**
   * Suspend a VM
   */
  async suspendVM(vmName: string): Promise<VMOperationResult> {
    const response = await api.post(`/vm/suspend/${vmName}`);
    return response.data;
  },
  
  /**
   * Resume a VM
   */
  async resumeVM(vmName: string): Promise<VMOperationResult> {
    const response = await api.post(`/vm/resume/${vmName}`);
    return response.data;
  },
  
  /**
   * Update VM details
   */
  async updateVM(vmName: string, vmData: Partial<VM>): Promise<VMOperationResult> {
    const response = await api.put(`/vm/${vmName}`, vmData);
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
