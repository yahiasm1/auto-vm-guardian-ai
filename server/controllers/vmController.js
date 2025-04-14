const vmService = require('../services/vmService');
const vmDbService = require('../services/vmDbService');

/**
 * VM Controller for handling VM-related requests
 */
const vmController = {
  /**
   * List all VMs
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async listVMs(req, res) {
    try {
      const { onlyRunning } = req.query;
      const vms = await vmService.listVMs(onlyRunning === "true");
      res.json({ success: true, vms });
    } catch (error) {
      console.error("Error in VM list endpoint:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to retrieve VM list",
      });
    }
  },

  /**
   * Create a new VM
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createVM(req, res) {
    try {
      const vmData = req.body;
      // Add the user who created the VM
      vmData.user_id = req.user.id;
      
      const result = await vmService.createVM(vmData);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating VM:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to create VM",
      });
    }
  },

  /**
   * Get VM info
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getVMInfo(req, res) {
    try {
      const { vmName } = req.params;
      const vmInfo = await vmService.getVMInfo(vmName);
      res.json({ success: true, vm: vmInfo });
    } catch (error) {
      console.error(`Error getting VM info for ${req.params.vmName}:`, error);
      res.status(500).json({
        success: false,
        message:
          error.message || `Failed to get info for VM ${req.params.vmName}`,
      });
    }
  },

  /**
   * Start a VM
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async startVM(req, res) {
    try {
      const { vmName } = req.params;
      const result = await vmService.startVM(vmName);
      res.json(result);
    } catch (error) {
      console.error(`Error starting VM ${req.params.vmName}:`, error);
      res.status(500).json({
        success: false,
        message: error.message || `Failed to start VM ${req.params.vmName}`,
      });
    }
  },

  /**
   * Stop a VM (forceful)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async stopVM(req, res) {
    try {
      const { vmName } = req.params;
      const result = await vmService.stopVM(vmName);
      res.json(result);
    } catch (error) {
      console.error(`Error stopping VM ${req.params.vmName}:`, error);
      res.status(500).json({
        success: false,
        message: error.message || `Failed to stop VM ${req.params.vmName}`,
      });
    }
  },

  /**
   * Shutdown a VM (graceful)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async shutdownVM(req, res) {
    try {
      const { vmName } = req.params;
      const result = await vmService.shutdownVM(vmName);
      res.json(result);
    } catch (error) {
      console.error(`Error shutting down VM ${req.params.vmName}:`, error);
      res.status(500).json({
        success: false,
        message: error.message || `Failed to shutdown VM ${req.params.vmName}`,
      });
    }
  },

  /**
   * Delete a VM
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteVM(req, res) {
    try {
      const { vmName } = req.params;
      const { removeStorage } = req.query;
      const result = await vmService.deleteVM(vmName, removeStorage === "true");
      res.json(result);
    } catch (error) {
      console.error(`Error deleting VM ${req.params.vmName}:`, error);
      res.status(500).json({
        success: false,
        message: error.message || `Failed to delete VM ${req.params.vmName}`,
      });
    }
  },

  /**
   * Restart a VM
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async restartVM(req, res) {
    try {
      const { vmName } = req.params;
      const result = await vmService.restartVM(vmName);
      res.json(result);
    } catch (error) {
      console.error(`Error restarting VM ${req.params.vmName}:`, error);
      res.status(500).json({
        success: false,
        message: error.message || `Failed to restart VM ${req.params.vmName}`,
      });
    }
  },

  /**
   * Suspend a VM
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async suspendVM(req, res) {
    try {
      const { vmName } = req.params;
      const result = await vmService.suspendVM(vmName);
      res.json(result);
    } catch (error) {
      console.error(`Error suspending VM ${req.params.vmName}:`, error);
      res.status(500).json({
        success: false,
        message: error.message || `Failed to suspend VM ${req.params.vmName}`,
      });
    }
  },

  /**
   * Resume a VM
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async resumeVM(req, res) {
    try {
      const { vmName } = req.params;
      const result = await vmService.resumeVM(vmName);
      res.json(result);
    } catch (error) {
      console.error(`Error resuming VM ${req.params.vmName}:`, error);
      res.status(500).json({
        success: false,
        message: error.message || `Failed to resume VM ${req.params.vmName}`,
      });
    }
  },
  
  /**
   * Update VM details
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateVM(req, res) {
    try {
      const { vmName } = req.params;
      const vmData = req.body;
      
      // Remove fields that should not be updated directly
      delete vmData.id;
      delete vmData.created_at;
      delete vmData.name; // Name is used as the identifier
      
      const updatedVM = await vmDbService.updateVM(vmName, vmData);
      res.json({
        success: true,
        message: `VM ${vmName} updated successfully`,
        vm: updatedVM
      });
    } catch (error) {
      console.error(`Error updating VM ${req.params.vmName}:`, error);
      res.status(500).json({
        success: false,
        message: error.message || `Failed to update VM ${req.params.vmName}`,
      });
    }
  }
};

module.exports = vmController;
