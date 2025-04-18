const db = require("../db/database");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

class UserController {
  // Get all users
  async getUsers(req, res) {
    try {
      const result = await db.query(`
        SELECT id, email, name, role, department, status, last_active, created_at
        FROM users
        ORDER BY name ASC
      `);

      return res.json({
        success: true,
        users: result.rows,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch users",
      });
    }
  }

  // Create a new user (admin only)
  async createUser(req, res) {
    try {
      const { email, password, name, role, department } = req.body;

      const existingUser = await db.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: "User with this email already exists",
        });
      }

      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);
      const userId = uuidv4();

      const result = await db.query(
        `INSERT INTO users (id, email, password, name, role, department, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, email, name, role, department, status, created_at`,
        [userId, email, hashedPassword, name, role, department, "active"]
      );

      return res.status(201).json({
        success: true,
        message: "User created successfully",
        user: result.rows[0],
      });
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to create user",
      });
    }
  }

  // Update own profile (user)
  async updateUser(req, res) {
    try {
      const userId = req.user.id;
      const { name, department } = req.body;

      const result = await db.query(
        `UPDATE users SET 
         name = COALESCE($1, name), 
         department = COALESCE($2, department)
         WHERE id = $3
         RETURNING id, email, name, role, department, status`,
        [name, department, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.json({
        success: true,
        message: "User updated successfully",
        user: result.rows[0],
      });
    } catch (error) {
      console.error("Error updating user:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to update user",
      });
    }
  }

  // Update any user by admin
  async adminUpdateUser(req, res) {
    try {
      const { id } = req.params;
      const { name, password, department, role } = req.body;

      let hashedPassword = null;
      if (password) {
        const salt = bcrypt.genSaltSync(10);
        hashedPassword = bcrypt.hashSync(password, salt);
      }

      const result = await db.query(
        `UPDATE users SET 
          name = COALESCE($1, name),
          department = COALESCE($2, department),
          role = COALESCE($3, role),
          password = COALESCE($4, password)
         WHERE id = $5
         RETURNING id, email, name, role, department, status, created_at`,
        [name, department, role, hashedPassword, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.json({
        success: true,
        message: "User updated successfully",
        user: result.rows[0],
      });
    } catch (error) {
      console.error("Error updating user by admin:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to update user",
      });
    }
  }

  // Delete user (admin only)
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      const result = await db.query(
        `DELETE FROM users WHERE id = $1 RETURNING id`,
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      return res.json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to delete user",
      });
    }
  }
}

module.exports = new UserController();
