
const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const authController = require('../controllers/authController');

const router = express.Router();

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authController.logout);
router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router;
