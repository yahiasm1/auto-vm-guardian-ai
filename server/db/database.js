
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Create database connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'vm_management',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Initialize database tables
async function initDatabase() {
  try {
    // Connect to the database
    const client = await pool.connect();
    
    try {
      // Create users table
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id UUID PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          name TEXT NOT NULL,
          role TEXT NOT NULL,
          department TEXT,
          status TEXT DEFAULT 'pending',
          last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create sessions table for JWT refresh tokens
      await client.query(`
        CREATE TABLE IF NOT EXISTS sessions (
          id SERIAL PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          refresh_token TEXT NOT NULL,
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Check if admin user exists, if not create default one
      const adminResult = await client.query("SELECT * FROM users WHERE email = 'admin@example.com'");
      
      if (adminResult.rows.length === 0) {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync('admin123', salt);
        const adminId = uuidv4();
        
        await client.query(
          "INSERT INTO users (id, email, password, name, role, department, status) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [adminId, 'admin@example.com', hashedPassword, 'Admin User', 'admin', 'IT', 'active']
        );
        
        console.log("Default admin user created successfully");
      }
      
      // Check if student user exists, if not create default one
      const studentResult = await client.query("SELECT * FROM users WHERE email = 'student@example.com'");
      
      if (studentResult.rows.length === 0) {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync('student123', salt);
        const studentId = uuidv4();
        
        await client.query(
          "INSERT INTO users (id, email, password, name, role, department, status) VALUES ($1, $2, $3, $4, $5, $6, $7)",
          [studentId, 'student@example.com', hashedPassword, 'Student User', 'student', 'Computer Science', 'active']
        );
        
        console.log("Default student user created successfully");
      }
      
    } finally {
      client.release();
    }
    
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

// Helper function to execute queries
async function query(text, params) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

module.exports = { 
  pool,
  query,
  initDatabase
};
