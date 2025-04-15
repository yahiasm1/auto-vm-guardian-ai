
const vmService = require('../services/vmService');
const db = require('../db/database');

/**
 * VM Controller - Handles VM-related HTTP requests
 */
class VMController {
  /**
   * List all VMs (admin only)
   */
  async listVMs(req, res) {
    try {
      const onlyRunning = req.query.running === 'true';
      const vms = await vmService.listVMs(onlyRunning);
      
      return res.json({
        success: true,
        vms
      });
    } catch (error) {
      console.error('Error listing VMs:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to list VMs'
      });
    }
  }
  
  /**
   * Get detailed info about a VM
   */
  async getVMInfo(req, res) {
    try {
      const { vmName } = req.params;
      
      // Check if user has access to this VM
      const userId = req.user.id;
      const isAdmin = req.user.role === 'admin';
      
      // Only allow access if admin or VM belongs to user
      if (!isAdmin) {
        const vm = await db.query(
          'SELECT * FROM vms WHERE name = $1', 
          [vmName]
        );
        
        if (vm.rows.length === 0 || vm.rows[0].user_id !== userId) {
          return res.status(403).json({
            success: false,
            message: 'You do not have permission to access this VM'
          });
        }
      }
      
      const vm = await vmService.getVMInfo(vmName);
      
      return res.json({
        success: true,
        vm
      });
    } catch (error) {
      console.error(`Error getting VM info for ${req.params.vmName}:`, error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to get VM info'
      });
    }
  }
  
  /**
   * Create a new VM (admin only)
   */
  async createVM(req, res) {
    try {
      const result = await vmService.createVM(req.body);
      
      return res.json(result);
    } catch (error) {
      console.error('Error creating VM:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to create VM'
      });
    }
  }
  
  /**
   * Start a VM
   */
  async startVM(req, res) {
    try {
      const { vmName } = req.params;
      
      // Check if user has access to this VM
      const userId = req.user.id;
      const isAdmin = req.user.role === 'admin';
      
      if (!isAdmin) {
        const vm = await db.query(
          'SELECT * FROM vms WHERE name = $1', 
          [vmName]
        );
        
        if (vm.rows.length === 0 || vm.rows[0].user_id !== userId) {
          return res.status(403).json({
            success: false,
            message: 'You do not have permission to access this VM'
          });
        }
      }
      
      const result = await vmService.startVM(vmName);
      
      return res.json(result);
    } catch (error) {
      console.error(`Error starting VM ${req.params.vmName}:`, error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to start VM'
      });
    }
  }
  
  /**
   * Stop a VM (forceful)
   */
  async stopVM(req, res) {
    try {
      const { vmName } = req.params;
      
      // Check user access
      const userId = req.user.id;
      const isAdmin = req.user.role === 'admin';
      
      if (!isAdmin) {
        const vm = await db.query(
          'SELECT * FROM vms WHERE name = $1', 
          [vmName]
        );
        
        if (vm.rows.length === 0 || vm.rows[0].user_id !== userId) {
          return res.status(403).json({
            success: false,
            message: 'You do not have permission to access this VM'
          });
        }
      }
      
      const result = await vmService.stopVM(vmName);
      
      return res.json(result);
    } catch (error) {
      console.error(`Error stopping VM ${req.params.vmName}:`, error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to stop VM'
      });
    }
  }
  
  /**
   * Shutdown a VM (graceful)
   */
  async shutdownVM(req, res) {
    // ...similar to stopVM, with access control
    try {
      const { vmName } = req.params;
      
      // Check user access
      const userId = req.user.id;
      const isAdmin = req.user.role === 'admin';
      
      if (!isAdmin) {
        const vm = await db.query(
          'SELECT * FROM vms WHERE name = $1', 
          [vmName]
        );
        
        if (vm.rows.length === 0 || vm.rows[0].user_id !== userId) {
          return res.status(403).json({
            success: false,
            message: 'You do not have permission to access this VM'
          });
        }
      }
      
      const result = await vmService.shutdownVM(vmName);
      
      return res.json(result);
    } catch (error) {
      console.error(`Error shutting down VM ${req.params.vmName}:`, error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to shutdown VM'
      });
    }
  }
  
  /**
   * Delete a VM (admin only)
   */
  async deleteVM(req, res) {
    try {
      const { vmName } = req.params;
      const removeStorage = req.query.removeStorage === 'true';
      
      const result = await vmService.deleteVM(vmName, removeStorage);
      
      return res.json(result);
    } catch (error) {
      console.error(`Error deleting VM ${req.params.vmName}:`, error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete VM'
      });
    }
  }
  
  /**
   * Restart a VM
   */
  async restartVM(req, res) {
    // ...similar to startVM, with access control
    try {
      const { vmName } = req.params;
      
      // Check user access
      const userId = req.user.id;
      const isAdmin = req.user.role === 'admin';
      
      if (!isAdmin) {
        const vm = await db.query(
          'SELECT * FROM vms WHERE name = $1', 
          [vmName]
        );
        
        if (vm.rows.length === 0 || vm.rows[0].user_id !== userId) {
          return res.status(403).json({
            success: false,
            message: 'You do not have permission to access this VM'
          });
        }
      }
      
      const result = await vmService.restartVM(vmName);
      
      return res.json(result);
    } catch (error) {
      console.error(`Error restarting VM ${req.params.vmName}:`, error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to restart VM'
      });
    }
  }
  
  /**
   * Suspend a VM
   */
  async suspendVM(req, res) {
    // ...similar to startVM, with access control
    try {
      const { vmName } = req.params;
      
      // Check user access
      const userId = req.user.id;
      const isAdmin = req.user.role === 'admin';
      
      if (!isAdmin) {
        const vm = await db.query(
          'SELECT * FROM vms WHERE name = $1', 
          [vmName]
        );
        
        if (vm.rows.length === 0 || vm.rows[0].user_id !== userId) {
          return res.status(403).json({
            success: false,
            message: 'You do not have permission to access this VM'
          });
        }
      }
      
      const result = await vmService.suspendVM(vmName);
      
      return res.json(result);
    } catch (error) {
      console.error(`Error suspending VM ${req.params.vmName}:`, error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to suspend VM'
      });
    }
  }
  
  /**
   * Resume a VM
   */
  async resumeVM(req, res) {
    // ...similar to startVM, with access control
    try {
      const { vmName } = req.params;
      
      // Check user access
      const userId = req.user.id;
      const isAdmin = req.user.role === 'admin';
      
      if (!isAdmin) {
        const vm = await db.query(
          'SELECT * FROM vms WHERE name = $1', 
          [vmName]
        );
        
        if (vm.rows.length === 0 || vm.rows[0].user_id !== userId) {
          return res.status(403).json({
            success: false,
            message: 'You do not have permission to access this VM'
          });
        }
      }
      
      const result = await vmService.resumeVM(vmName);
      
      return res.json(result);
    } catch (error) {
      console.error(`Error resuming VM ${req.params.vmName}:`, error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to resume VM'
      });
    }
  }
  
  /**
   * Update VM details (admin only)
   */
  async updateVM(req, res) {
    try {
      const { vmName } = req.params;
      const result = await vmService.updateVM(vmName, req.body);
      
      return res.json(result);
    } catch (error) {
      console.error(`Error updating VM ${req.params.vmName}:`, error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to update VM'
      });
    }
  }

  /**
   * Request a new VM (for students and instructors)
   */
  async requestVM(req, res) {
    try {
      const { purpose, memory, vcpus, storage, os_type, course, duration, description } = req.body;
      const userId = req.user.id;
      const username = req.user.name || req.user.email;

      // Validate request
      if (!purpose) {
        return res.status(400).json({
          success: false,
          message: 'Purpose is required for VM request'
        });
      }

      // Save VM request to database
      const result = await db.query(
        `INSERT INTO vm_requests 
         (user_id, username, purpose, memory, vcpus, storage, os_type, course, duration, description, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
         RETURNING id`,
        [userId, username, purpose, memory, vcpus, storage, os_type, course, duration, description, 'pending']
      );

      return res.status(201).json({
        success: true,
        message: 'VM request submitted successfully',
        requestId: result.rows[0].id
      });
    } catch (error) {
      console.error('Error requesting VM:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to submit VM request'
      });
    }
  }

  /**
   * List all VM requests (admin only)
   */
  async listVMRequests(req, res) {
    try {
      // Get all requests from database
      const result = await db.query(
        `SELECT * FROM vm_requests ORDER BY created_at DESC`
      );

      return res.json({
        success: true,
        requests: result.rows
      });
    } catch (error) {
      console.error('Error listing VM requests:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to list VM requests'
      });
    }
  }

  /**
   * Get VM requests for the current user
   */
  async getMyVMRequests(req, res) {
    try {
      const userId = req.user.id;

      // Get user's requests from database
      const result = await db.query(
        `SELECT * FROM vm_requests WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
      );

      return res.json({
        success: true,
        requests: result.rows
      });
    } catch (error) {
      console.error('Error getting user VM requests:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to get your VM requests'
      });
    }
  }

  /**
   * Approve a VM request (admin only)
   */
  async approveVMRequest(req, res) {
    try {
      const { requestId } = req.params;
      
      // Get the request details
      const requestResult = await db.query(
        `SELECT * FROM vm_requests WHERE id = $1`,
        [requestId]
      );

      if (requestResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'VM request not found'
        });
      }

      const request = requestResult.rows[0];

      // Request is already processed
      if (request.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: `This request has already been ${request.status}`
        });
      }

      // Create the VM using the request details and additional config from admin
      const vmConfig = {
        name: req.body.name || `vm-${request.id.substring(0, 8)}`,
        memory: req.body.memory || request.memory || 1024,
        vcpus: req.body.vcpus || request.vcpus || 1,
        storage: req.body.storage || request.storage || 10,
        os_type: req.body.os_type || request.os_type || 'linux',
        description: req.body.description || `VM created for ${request.purpose}${request.course ? ` - Course: ${request.course}` : ''}`,
        user_id: request.user_id
      };

      // Create the VM
      const vmResult = await vmService.createVM(vmConfig);

      // Update the request status
      await db.query(
        `UPDATE vm_requests 
         SET status = $1, 
             vm_id = $2, 
             response_message = $3, 
             updated_at = NOW() 
         WHERE id = $4`,
        ['approved', vmResult.vm?.id || null, req.body.message || 'Your VM request has been approved.', requestId]
      );

      return res.json({
        success: true,
        message: 'VM request approved and VM created',
        vmName: vmConfig.name
      });
    } catch (error) {
      console.error(`Error approving VM request ${req.params.requestId}:`, error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to approve VM request'
      });
    }
  }

  /**
   * Reject a VM request (admin only)
   */
  async rejectVMRequest(req, res) {
    try {
      const { requestId } = req.params;
      const { reason } = req.body;
      
      // Get the request details
      const requestResult = await db.query(
        `SELECT * FROM vm_requests WHERE id = $1`,
        [requestId]
      );

      if (requestResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'VM request not found'
        });
      }

      const request = requestResult.rows[0];

      // Request is already processed
      if (request.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: `This request has already been ${request.status}`
        });
      }

      // Update the request status
      await db.query(
        `UPDATE vm_requests 
         SET status = $1, 
             response_message = $2, 
             updated_at = NOW() 
         WHERE id = $3`,
        ['rejected', reason || 'Your VM request has been rejected.', requestId]
      );

      return res.json({
        success: true,
        message: 'VM request rejected'
      });
    } catch (error) {
      console.error(`Error rejecting VM request ${req.params.requestId}:`, error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to reject VM request'
      });
    }
  }
}

module.exports = new VMController();
