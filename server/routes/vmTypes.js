
const express = require("express");
const router = express.Router();
const vmTypeController = require("../controllers/vmTypeController");
const { authenticateToken, authorizeRoles } = require("../middleware/auth");

// Get all VM types - accessible by all authenticated users
router.get(
  "/",
  authenticateToken,
  vmTypeController.getAllVMTypes
);

// Get VM type by ID - accessible by all authenticated users
router.get(
  "/:id",
  authenticateToken,
  vmTypeController.getVMTypeById
);

// Create new VM type - admin only
router.post(
  "/",
  authenticateToken,
  authorizeRoles(["admin"]),
  vmTypeController.createVMType
);

// Update VM type - admin only
router.put(
  "/:id",
  authenticateToken,
  authorizeRoles(["admin"]),
  vmTypeController.updateVMType
);

// Delete VM type - admin only
router.delete(
  "/:id",
  authenticateToken,
  authorizeRoles(["admin"]),
  vmTypeController.deleteVMType
);

module.exports = router;
