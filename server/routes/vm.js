const express = require("express");
const router = express.Router();
const vmService = require("../services/vmService");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// Get all VMs - admin only
router.get(
  "/list",
  authenticateToken,
  authorizeRoles(["admin"]),
  async (req, res) => {
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
  }
);

// Get VM info
router.get("/:vmName", authenticateToken, async (req, res) => {
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
});

// Start a VM
router.get("/:vmName", authenticateToken, async (req, res) => {
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
});

// Stop a VM (forceful)
router.post("/stop/:vmName", authenticateToken, async (req, res) => {
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
});

// Shutdown a VM (graceful)
router.post("/shutdown/:vmName", authenticateToken, async (req, res) => {
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
});

// Delete a VM
router.delete(
  "/:vmName",
  authenticateToken,
  authorizeRoles(["admin"]),
  async (req, res) => {
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
  }
);

// Restart a VM
router.post("/restart/:vmName", authenticateToken, async (req, res) => {
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
});

// Suspend a VM
router.post("/suspend/:vmName", authenticateToken, async (req, res) => {
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
});

// Resume a VM
router.post("/resume/:vmName", authenticateToken, async (req, res) => {
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
});

module.exports = router;
