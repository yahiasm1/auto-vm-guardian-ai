
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

// Get VMs owned by current user - for students
router.get(
  "/my-vms",
  authenticateToken,
  vmController.getMyVMs
);

// Get recent VMs and resource stats for admin dashboard
router.get(
  "/dashboard-data",
  authenticateToken,
  authorizeRoles(["admin"]),
  vmController.getDashboardData
);

// Create a new VM - admin only
router.post(
  "/create",
  authenticateToken,
  authorizeRoles(["admin"]),
  vmController.createVM
);

// VM request endpoints
router.post("/request", authenticateToken, vmController.requestVM);
router.get("/requests", authenticateToken, authorizeRoles(["admin"]), vmController.listVMRequests);
router.get("/recent-requests", authenticateToken, authorizeRoles(["admin"]), vmController.getRecentVMRequests);
router.post("/request/:requestId/approve", authenticateToken, authorizeRoles(["admin"]), vmController.approveVMRequest);
router.post("/request/:requestId/reject", authenticateToken, authorizeRoles(["admin"]), vmController.rejectVMRequest);
router.get("/my-requests", authenticateToken, vmController.getMyVMRequests);

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
