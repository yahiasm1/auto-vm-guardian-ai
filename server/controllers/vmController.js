const vmService = require("../services/vmService");
const vmDbService = require("../services/vmDbService");
const db = require("../db/database");

/**
 * VM Controller - Handles VM-related HTTP requests
 */
class VMController {
  /**
   * List all VMs (admin only)
   */
  async listVMs(req, res) {
    try {
      const onlyRunning = req.query.running === "true";
      const vms = await vmService.listVMs(onlyRunning);

      return res.json({
        success: true,
        vms,
      });
    } catch (error) {
      console.error("Error listing VMs:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to list VMs",
      });
    }
  }

  /**
   * Get dashboard data for admin
   */
  async getDashboardData(req, res) {
    try {
      // Get total VMs count
      const vmCountResult = await db.query("SELECT COUNT(*) FROM vms");
      const totalVms = parseInt(vmCountResult.rows[0].count);

      // Get running VMs count
      const runningVmCountResult = await db.query(
        "SELECT COUNT(*) FROM vms WHERE state LIKE '%running%'"
      );
      const runningVms = parseInt(runningVmCountResult.rows[0].count);

      // Get total storage used (in GB)
      const storageResult = await db.query(
        "SELECT COALESCE(SUM(NULLIF(storage, '')::numeric), 0) as total FROM vms"
      );
      const storageUsedGB = parseFloat(storageResult.rows[0].total) || 0;
      const storageUsedTB = (storageUsedGB / 1024).toFixed(2);

      // Get active users count
      const activeUsersResult = await db.query(
        "SELECT COUNT(*) FROM users WHERE last_active > NOW() - INTERVAL '30 days'"
      );
      const activeUsers = parseInt(activeUsersResult.rows[0].count);

      // Get recent VMs (last 5)
      const recentVmsResult = await db.query(
        "SELECT * FROM vms ORDER BY created_at DESC LIMIT 5"
      );

      // Calculate resource usage
      const resourceStats = {
        cpu: { used: 0, total: 100 }, // Default values - replace with actual monitoring data
        ram: { used: 0, total: 64 }, // Default values - replace with actual monitoring data
        storage: { used: storageUsedTB, total: 2 },
      };

      // Calculate CPU and RAM usage based on VM allocations
      const resourceAllocationResult = await db.query(
        "SELECT SUM(vcpus) as total_cpu, SUM(memory) as total_memory FROM vms WHERE state LIKE '%running%'"
      );
      if (resourceAllocationResult.rows[0].total_cpu) {
        resourceStats.cpu.used = parseInt(
          resourceAllocationResult.rows[0].total_cpu
        );
      }

      if (resourceAllocationResult.rows[0].total_memory) {
        resourceStats.ram.used = Math.round(
          parseInt(resourceAllocationResult.rows[0].total_memory) / 1024
        ); // Convert MB to GB
      }

      return res.json({
        success: true,
        stats: {
          totalVms,
          runningVms,
          storageUsed: parseFloat(storageUsedTB),
          activeUsers,
        },
        recentVms: recentVmsResult.rows,
        resourceStats,
      });
    } catch (error) {
      console.error("Error getting dashboard data:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to get dashboard data",
      });
    }
  }

  /**
   * Get recent VM requests (admin only)
   */
  async getRecentVMRequests(req, res) {
    try {
      // Get recent VM requests (last 5)
      const recentRequestsResult = await db.query(
        "SELECT * FROM vm_requests ORDER BY created_at DESC LIMIT 5"
      );

      return res.json({
        success: true,
        requests: recentRequestsResult.rows,
      });
    } catch (error) {
      console.error("Error getting recent VM requests:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to get recent VM requests",
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
      const isAdmin = req.user.role === "admin";

      // Only allow access if admin or VM belongs to user
      if (!isAdmin) {
        const vm = await db.query("SELECT * FROM vms WHERE name = $1", [
          vmName,
        ]);

        if (vm.rows.length === 0 || vm.rows[0].user_id !== userId) {
          return res.status(403).json({
            success: false,
            message: "You do not have permission to access this VM",
          });
        }
      }

      const vm = await vmService.getVMInfo(vmName);

      return res.json({
        success: true,
        vm,
      });
    } catch (error) {
      console.error(`Error getting VM info for ${req.params.vmName}:`, error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to get VM info",
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
      console.error("Error creating VM:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to create VM",
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
      const isAdmin = req.user.role === "admin";

      if (!isAdmin) {
        const vm = await db.query("SELECT * FROM vms WHERE name = $1", [
          vmName,
        ]);

        if (vm.rows.length === 0 || vm.rows[0].user_id !== userId) {
          return res.status(403).json({
            success: false,
            message: "You do not have permission to access this VM",
          });
        }
      }

      const result = await vmService.startVM(vmName);

      return res.json(result);
    } catch (error) {
      console.error(`Error starting VM ${req.params.vmName}:`, error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to start VM",
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
      const isAdmin = req.user.role === "admin";

      if (!isAdmin) {
        const vm = await db.query("SELECT * FROM vms WHERE name = $1", [
          vmName,
        ]);

        if (vm.rows.length === 0 || vm.rows[0].user_id !== userId) {
          return res.status(403).json({
            success: false,
            message: "You do not have permission to access this VM",
          });
        }
      }

      const result = await vmService.stopVM(vmName);

      return res.json(result);
    } catch (error) {
      console.error(`Error stopping VM ${req.params.vmName}:`, error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to stop VM",
      });
    }
  }

  /**
   * Shutdown a VM (graceful)
   */
  async shutdownVM(req, res) {
    try {
      const { vmName } = req.params;

      // Check user access
      const userId = req.user.id;
      const isAdmin = req.user.role === "admin";

      if (!isAdmin) {
        const vm = await db.query("SELECT * FROM vms WHERE name = $1", [
          vmName,
        ]);

        if (vm.rows.length === 0 || vm.rows[0].user_id !== userId) {
          return res.status(403).json({
            success: false,
            message: "You do not have permission to access this VM",
          });
        }
      }

      const result = await vmService.shutdownVM(vmName);

      return res.json(result);
    } catch (error) {
      console.error(`Error shutting down VM ${req.params.vmName}:`, error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to shutdown VM",
      });
    }
  }

  /**
   * Delete a VM (admin only)
   */
  async deleteVM(req, res) {
    try {
      const { vmName } = req.params;
      const removeStorage = req.query.removeStorage === "true";

      const result = await vmService.deleteVM(vmName, removeStorage);

      return res.json(result);
    } catch (error) {
      console.error(`Error deleting VM ${req.params.vmName}:`, error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to delete VM",
      });
    }
  }

  /**
   * Restart a VM
   */
  async restartVM(req, res) {
    try {
      const { vmName } = req.params;

      // Check user access
      const userId = req.user.id;
      const isAdmin = req.user.role === "admin";

      if (!isAdmin) {
        const vm = await db.query("SELECT * FROM vms WHERE name = $1", [
          vmName,
        ]);

        if (vm.rows.length === 0 || vm.rows[0].user_id !== userId) {
          return res.status(403).json({
            success: false,
            message: "You do not have permission to access this VM",
          });
        }
      }

      const result = await vmService.restartVM(vmName);

      return res.json(result);
    } catch (error) {
      console.error(`Error restarting VM ${req.params.vmName}:`, error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to restart VM",
      });
    }
  }

  /**
   * Suspend a VM
   */
  async suspendVM(req, res) {
    try {
      const { vmName } = req.params;

      // Check user access
      const userId = req.user.id;
      const isAdmin = req.user.role === "admin";

      if (!isAdmin) {
        const vm = await db.query("SELECT * FROM vms WHERE name = $1", [
          vmName,
        ]);

        if (vm.rows.length === 0 || vm.rows[0].user_id !== userId) {
          return res.status(403).json({
            success: false,
            message: "You do not have permission to access this VM",
          });
        }
      }

      const result = await vmService.suspendVM(vmName);

      return res.json(result);
    } catch (error) {
      console.error(`Error suspending VM ${req.params.vmName}:`, error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to suspend VM",
      });
    }
  }

  /**
   * Resume a VM
   */
  async resumeVM(req, res) {
    try {
      const { vmName } = req.params;

      // Check user access
      const userId = req.user.id;
      const isAdmin = req.user.role === "admin";

      if (!isAdmin) {
        const vm = await db.query("SELECT * FROM vms WHERE name = $1", [
          vmName,
        ]);

        if (vm.rows.length === 0 || vm.rows[0].user_id !== userId) {
          return res.status(403).json({
            success: false,
            message: "You do not have permission to access this VM",
          });
        }
      }

      const result = await vmService.resumeVM(vmName);

      return res.json(result);
    } catch (error) {
      console.error(`Error resuming VM ${req.params.vmName}:`, error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to resume VM",
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
        message: error.message || "Failed to update VM",
      });
    }
  }

  /**
   * List VMs owned by the current user (for students)
   */
  async getMyVMs(req, res) {
    try {
      const userId = req.user.id;
      const onlyRunning = req.query.running === "true";

      // Get all VMs
      const allVMs = await vmService.listVMs(onlyRunning);

      // Filter VMs that belong to the current user
      const userVMs = allVMs.filter((vm) => {
        // Check if VM has a user_id field and it matches the current user
        return vm.user_id && vm.user_id === userId;
      });

      return res.json({
        success: true,
        vms: userVMs,
      });
    } catch (error) {
      console.error("Error listing user VMs:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to list your VMs",
      });
    }
  }

  /**
   * Request a new VM (for students and instructors)
   */
  async requestVM(req, res) {
    try {
      const {
        purpose,
        memory,
        vcpus,
        storage,
        os_type,
        vm_type_id,
        course,
        duration,
        description,
      } = req.body;
      const userId = req.user.id;
      const username = req.user.name || req.user.email;

      // Validate request
      if (!purpose) {
        return res.status(400).json({
          success: false,
          message: "Purpose is required for VM request",
        });
      }

      // Save VM request to database
      const result = await db.query(
        `INSERT INTO vm_requests 
         (user_id, username, purpose, memory, vcpus, storage, os_type,vm_type_id, course, duration, description, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,$12) 
         RETURNING id`,
        [
          userId,
          username,
          purpose,
          memory,
          vcpus,
          storage,
          os_type.id,
          vm_type_id,
          course,
          duration,
          description,
          "pending",
        ]
      );

      return res.status(201).json({
        success: true,
        message: "VM request submitted successfully",
        requestId: result.rows[0].id,
      });
    } catch (error) {
      console.error("Error requesting VM:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to submit VM request",
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
        requests: result.rows,
      });
    } catch (error) {
      console.error("Error listing VM requests:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to list VM requests",
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
        requests: result.rows,
      });
    } catch (error) {
      console.error("Error getting user VM requests:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to get your VM requests",
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
          message: "VM request not found",
        });
      }

      const request = requestResult.rows[0];

      // Already processed?
      if (request.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: `This request has already been ${request.status}`,
        });
      }

      // Fetch VM type (needed for iso_path & os_type validation)
      const vmTypeResult = await db.query(
        `SELECT * FROM vm_types WHERE id = $1`,
        [request.vm_type_id]
      );

      if (vmTypeResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: "The associated VM type does not exist.",
        });
      }

      const vmType = vmTypeResult.rows[0];

      // Build the VM config
      const vmConfig = {
        name: req.body.name || `vm-${request.id.substring(0, 8)}`,
        memory: req.body.memory || request.memory || 1024,
        vcpus: req.body.vcpus || request.vcpus || 1,
        storage: req.body.storage || request.storage || 5,
        os_type: vmType.os_type, // use DB value, not user override
        iso_path: vmType.iso_path,
        vm_type_id: vmType.id,
        user_id: request.user_id,
        description:
          req.body.description ||
          `VM created for ${request.purpose}${
            request.course ? ` - Course: ${request.course}` : ""
          }`,
      };

      // Create VM
      const vmResult = await vmService.createVM(vmConfig);

      // Mark request as approved
      await db.query(
        `UPDATE vm_requests 
       SET status = $1, 
           vm_id = $2, 
           response_message = $3, 
           updated_at = NOW() 
       WHERE id = $4`,
        [
          "approved",
          vmResult.vm?.id || null,
          req.body.message || "Your VM request has been approved.",
          requestId,
        ]
      );

      return res.json({
        success: true,
        message: "VM request approved and VM created",
        vmName: vmConfig.name,
      });
    } catch (error) {
      console.error(
        `Error approving VM request ${req.params.requestId}:`,
        error
      );
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to approve VM request",
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
          message: "VM request not found",
        });
      }

      const request = requestResult.rows[0];

      // Request is already processed
      if (request.status !== "pending") {
        return res.status(400).json({
          success: false,
          message: `This request has already been ${request.status}`,
        });
      }

      // Update the request status
      await db.query(
        `UPDATE vm_requests 
         SET status = $1, 
             response_message = $2, 
             updated_at = NOW() 
         WHERE id = $3`,
        ["rejected", reason || "Your VM request has been rejected.", requestId]
      );

      return res.json({
        success: true,
        message: "VM request rejected",
      });
    } catch (error) {
      console.error(
        `Error rejecting VM request ${req.params.requestId}:`,
        error
      );
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to reject VM request",
      });
    }
  }

  /**
   * Clean up unused QCOW2 disk files
   */
  async cleanUnusedDisks(req, res) {
    try {
      const result = await vmService.cleanUnusedDisks();
      return res.json(result);
    } catch (error) {
      console.error("Error cleaning unused disks:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to clean unused disks",
      });
    }
  }
}

module.exports = new VMController();
