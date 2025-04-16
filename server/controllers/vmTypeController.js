
const vmTypeService = require("../services/vmTypeService");

/**
 * VM Type Controller for handling VM Type API requests
 */
const vmTypeController = {
  /**
   * Get all VM types
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getAllVMTypes: async (req, res) => {
    try {
      const vmTypes = await vmTypeService.getAllVMTypes();
      res.status(200).json({ vmTypes });
    } catch (error) {
      console.error("Error getting VM types:", error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Get VM type by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  getVMTypeById: async (req, res) => {
    const { id } = req.params;
    
    try {
      const vmType = await vmTypeService.getVMTypeById(id);
      
      if (!vmType) {
        return res.status(404).json({ error: "VM type not found" });
      }
      
      res.status(200).json({ vmType });
    } catch (error) {
      console.error("Error getting VM type:", error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Create a new VM type
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  createVMType: async (req, res) => {
    const vmTypeData = req.body;
    
    try {
      // Validate required fields
      if (!vmTypeData.name) {
        return res.status(400).json({ error: "VM type name is required" });
      }
      
      if (!vmTypeData.os_type) {
        return res.status(400).json({ error: "OS type is required" });
      }
      
      const vmType = await vmTypeService.createVMType(vmTypeData);
      res.status(201).json({ 
        success: true,
        message: "VM type created successfully",
        vmType 
      });
    } catch (error) {
      console.error("Error creating VM type:", error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Update a VM type
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  updateVMType: async (req, res) => {
    const { id } = req.params;
    const vmTypeData = req.body;
    
    try {
      // Validate required fields
      if (!vmTypeData.name) {
        return res.status(400).json({ error: "VM type name is required" });
      }
      
      if (!vmTypeData.os_type) {
        return res.status(400).json({ error: "OS type is required" });
      }
      
      const vmType = await vmTypeService.updateVMType(id, vmTypeData);
      
      res.status(200).json({ 
        success: true,
        message: "VM type updated successfully",
        vmType 
      });
    } catch (error) {
      console.error("Error updating VM type:", error);
      
      if (error.message.includes("not found")) {
        return res.status(404).json({ error: error.message });
      }
      
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Delete a VM type
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  deleteVMType: async (req, res) => {
    const { id } = req.params;
    
    try {
      const deleted = await vmTypeService.deleteVMType(id);
      
      if (!deleted) {
        return res.status(404).json({ error: "VM type not found" });
      }
      
      res.status(200).json({ 
        success: true,
        message: "VM type deleted successfully" 
      });
    } catch (error) {
      console.error("Error deleting VM type:", error);
      
      // If VM type is in use, return a specific error
      if (error.message.includes("in use")) {
        return res.status(400).json({ error: error.message });
      }
      
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = vmTypeController;
