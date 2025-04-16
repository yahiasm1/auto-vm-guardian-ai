
import api from './api';

export interface VMType {
  id: string;
  name: string;
  os_type: string;
  iso_path?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export const vmTypeService = {
  /**
   * Get all VM types
   */
  async getAllVMTypes(): Promise<VMType[]> {
    try {
      const response = await api.get('/vm-types');
      return response.data.vmTypes || [];
    } catch (error) {
      console.error('Error fetching VM types:', error);
      return [];
    }
  },

  /**
   * Get VM type by ID
   */
  async getVMTypeById(id: string): Promise<VMType | null> {
    try {
      const response = await api.get(`/vm-types/${id}`);
      return response.data.vmType || null;
    } catch (error) {
      console.error(`Error fetching VM type ${id}:`, error);
      return null;
    }
  },

  /**
   * Create a new VM type
   */
  async createVMType(vmTypeData: Omit<VMType, 'id' | 'created_at' | 'updated_at'>): Promise<{ 
    success: boolean;
    message: string;
    vmType?: VMType;
  }> {
    try {
      const response = await api.post('/vm-types', vmTypeData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating VM type:', error);
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to create VM type'
      };
    }
  },

  /**
   * Update a VM type
   */
  async updateVMType(id: string, vmTypeData: Partial<VMType>): Promise<{
    success: boolean;
    message: string;
    vmType?: VMType;
  }> {
    try {
      const response = await api.put(`/vm-types/${id}`, vmTypeData);
      return response.data;
    } catch (error: any) {
      console.error(`Error updating VM type ${id}:`, error);
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to update VM type'
      };
    }
  },

  /**
   * Delete a VM type
   */
  async deleteVMType(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await api.delete(`/vm-types/${id}`);
      return response.data;
    } catch (error: any) {
      console.error(`Error deleting VM type ${id}:`, error);
      return {
        success: false,
        message: error.response?.data?.error || 'Failed to delete VM type'
      };
    }
  }
};

export default vmTypeService;
