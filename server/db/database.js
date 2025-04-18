const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

// Create database connection pool with more flexible configuration
const pool = new Pool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "vm_management",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "1234", // Changed default password
  // Add connection timeout to avoid hanging
  connectionTimeoutMillis: 5000,
});

// Initialize database tables
async function initDatabase() {
  let client;

  try {
    // Test the connection first
    client = await pool.connect();
    console.log("Successfully connected to PostgreSQL database");

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

    // Create VM Types table
    await client.query(`
      CREATE TABLE IF NOT EXISTS vm_types (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        os_type TEXT NOT NULL,
        iso_path TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create VMs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS vms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL UNIQUE,
        state TEXT NOT NULL DEFAULT 'stopped',
        uuid TEXT UNIQUE,
        os_type TEXT,
        disk_path TEXT,
        memory INTEGER,
        vcpus INTEGER,
        storage INTEGER,
        user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        vm_type_id UUID REFERENCES vm_types(id) ON DELETE SET NULL,
        description TEXT,
        ip_address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create VM Requests table
    await client.query(`
      CREATE TABLE IF NOT EXISTS vm_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        username TEXT,
        purpose TEXT NOT NULL,
        memory INTEGER,
        vcpus INTEGER,
        storage INTEGER,
        os_type TEXT,
        vm_type_id UUID REFERENCES vm_types(id) ON DELETE SET NULL,
        course TEXT,
        duration TEXT,
        description TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        response_message TEXT,
        vm_id UUID REFERENCES vms(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Check if admin user exists, if not create default one
    const adminResult = await client.query(
      "SELECT * FROM users WHERE email = 'admin@example.com'"
    );

    if (adminResult.rows.length === 0) {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync("admin123", salt);
      const adminId = uuidv4();

      await client.query(
        "INSERT INTO users (id, email, password, name, role, department, status) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [
          adminId,
          "admin@example.com",
          hashedPassword,
          "Admin User",
          "admin",
          "IT",
          "active",
        ]
      );

      console.log("Default admin user created successfully");
    }

    // Check if student user exists, if not create default one
    const studentResult = await client.query(
      "SELECT * FROM users WHERE email = 'student@example.com'"
    );

    if (studentResult.rows.length === 0) {
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync("student123", salt);
      const studentId = uuidv4();

      await client.query(
        "INSERT INTO users (id, email, password, name, role, department, status) VALUES ($1, $2, $3, $4, $5, $6, $7)",
        [
          studentId,
          "student@example.com",
          hashedPassword,
          "Student User",
          "student",
          "Computer Science",
          "active",
        ]
      );

      console.log("Default student user created successfully");
    }

    // Check if we have any VM types, if not add some defaults
    const vmTypesResult = await client.query("SELECT * FROM vm_types LIMIT 1");

    if (vmTypesResult.rows.length === 0) {
      // Add some default VM types
      await client.query(`
        INSERT INTO vm_types (name, os_type, iso_path, description)
        VALUES 
          ('Ubuntu 22.04 LTS', 'linux', '/iso/ubuntu-22.04-desktop-amd64.iso', 'Ubuntu Desktop Long Term Support release'),
          ('Windows 10', 'windows', '/iso/windows10.iso', 'Windows 10 Professional'),
          ('Debian 12', 'linux', '/iso/debian-12.0.0-amd64-netinst.iso', 'Debian stable minimal installation'),
          ('CentOS 7', 'linux', '/iso/CentOS-7-x86_64-DVD.iso', 'CentOS 7 server edition')
      `);

      console.log("Default VM types created successfully");
    }

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  } finally {
    if (client) {
      client.release();
    }
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
  initDatabase,
};
