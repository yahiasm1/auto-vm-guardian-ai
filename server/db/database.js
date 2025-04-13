
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database connection
const dbPath = path.resolve(__dirname, 'vm_management.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
function initDatabase() {
  db.serialize(() => {
    // Create users table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        department TEXT,
        status TEXT DEFAULT 'pending',
        last_active TEXT DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create sessions table for JWT refresh tokens
    db.run(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        refresh_token TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      )
    `);

    const bcrypt = require('bcryptjs');
    const { v4: uuidv4 } = require('uuid');
    const salt = bcrypt.genSaltSync(10);
    
    // Check if admin user exists, if not create default one
    db.get("SELECT * FROM users WHERE email = 'admin@example.com'", (err, row) => {
      if (err) {
        console.error("Error checking for admin user:", err);
        return;
      }
      
      if (!row) {
        const hashedPassword = bcrypt.hashSync('admin123', salt);
        const adminId = uuidv4();
        
        db.run(
          "INSERT INTO users (id, email, password, name, role, department, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [adminId, 'admin@example.com', hashedPassword, 'Admin User', 'admin', 'IT', 'active'],
          function(err) {
            if (err) {
              console.error("Error creating admin user:", err);
              return;
            }
            console.log("Default admin user created successfully");
          }
        );
      }
    });
    
    // Check if student user exists, if not create default one
    db.get("SELECT * FROM users WHERE email = 'student@example.com'", (err, row) => {
      if (err) {
        console.error("Error checking for student user:", err);
        return;
      }
      
      if (!row) {
        const hashedPassword = bcrypt.hashSync('student123', salt);
        const studentId = uuidv4();
        
        db.run(
          "INSERT INTO users (id, email, password, name, role, department, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [studentId, 'student@example.com', hashedPassword, 'Student User', 'student', 'Computer Science', 'active'],
          function(err) {
            if (err) {
              console.error("Error creating student user:", err);
              return;
            }
            console.log("Default student user created successfully");
          }
        );
      }
    });
  });
}

module.exports = { 
  db, 
  initDatabase
};
