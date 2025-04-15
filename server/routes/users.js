
const express = require('express');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const userController = require('../controllers/userController');

const router = express.Router();

// Get all users (admin can get all users)
router.get('/', authenticateToken, userController.getUsers);

// Create a new user (admin only)
router.post('/', authenticateToken, authorizeRoles(['admin']), userController.createUser);

// Update user info (user can update their own info, admin can update any user)
router.put('/:id', authenticateToken, userController.updateUser);

module.exports = router;
