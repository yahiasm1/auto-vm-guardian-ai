
const db = require('../db/database');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require("uuid");

class UserController {
  /**
   * Get all users
   */
  async getUsers(req, res) {
    try {
      const result = await db.query(`
        SELECT id, email, name, role, department, status, last_active, created_at
        FROM users
        ORDER BY name ASC
      `);
      
      return res.json({
        success: true,
        users: result.rows
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch users'
      });
    }
  }
  
  /**
   * Create a new user (admin only)
   */
  async createUser(req, res) {
    try {
      const { email, password, name, role, department } = req.body;
      
      // Check if user already exists
      const existingUser = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      
      if (existingUser.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'User with this email already exists'
        });
      }
      
      // Hash password
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);
      
      // Create user with active status
      const userId = uuidv4();
      const result = await db.query(
        `INSERT INTO users (id, email, password, name, role, department, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, email, name, role, department, status, created_at`,
        [userId, email, hashedPassword, name, role, department, 'active']
      );
      
      return res.status(201).json({
        success: true,
        message: 'User created successfully',
        user: result.rows[0]
      });
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to create user'
      });
    }
  }
}

module.exports = new UserController();
