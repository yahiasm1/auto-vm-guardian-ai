
const express = require("express");
const router = express.Router();
const vmController = require("../controllers/vmController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// Get all VMs - admin only
router.get(
  "/list",
  authenticateToken,
  authorizeRoles(["admin"]),
  vmController.listVMs
);

// Get VM info
router.get("/:vmName", authenticateToken, vmController.getVMInfo);

// Start a VM
router.post("/start/:vmName", authenticateToken, vmController.startVM);

// Stop a VM (forceful)
router.post("/stop/:vmName", authenticateToken, vmController.stopVM);

// Shutdown a VM (graceful)
router.post("/shutdown/:vmName", authenticateToken, vmController.shutdownVM);

// Delete a VM
router.delete(
  "/:vmName",
  authenticateToken,
  authorizeRoles(["admin"]),
  vmController.deleteVM
);

// Restart a VM
router.post("/restart/:vmName", authenticateToken, vmController.restartVM);

// Suspend a VM
router.post("/suspend/:vmName", authenticateToken, vmController.suspendVM);

// Resume a VM
router.post("/resume/:vmName", authenticateToken, vmController.resumeVM);

// Update VM details
router.put(
  "/:vmName",
  authenticateToken,
  authorizeRoles(["admin"]),
  vmController.updateVM
);

module.exports = router;
