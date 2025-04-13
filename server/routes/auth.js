
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  const { email, password, name, role, department } = req.body;
  
  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  try {
    // Check if email already exists
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (row) {
        return res.status(409).json({ error: 'Email already in use' });
      }
      
      // Hash password
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);
      const userId = uuidv4();
      
      // Insert new user
      db.run(
        "INSERT INTO users (id, email, password, name, role, department) VALUES (?, ?, ?, ?, ?, ?)",
        [userId, email.toLowerCase(), hashedPassword, name, role, department || ''],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create user' });
          }
          
          res.status(201).json({ message: 'User registered successfully' });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  try {
    db.get("SELECT * FROM users WHERE email = ?", [email.toLowerCase()], async (err, user) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      // Check password
      const isMatch = bcrypt.compareSync(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
      
      // Update last active timestamp
      db.run("UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ?", [user.id]);
      
      // Create tokens
      const accessToken = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '15m' }
      );
      
      const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_REFRESH_SECRET || 'your_refresh_secret',
        { expiresIn: '7d' }
      );
      
      // Store refresh token in database
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
      
      db.run(
        "INSERT INTO sessions (user_id, refresh_token, expires_at) VALUES (?, ?, ?)",
        [user.id, refreshToken, expiresAt.toISOString()],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create session' });
          }
          
          // Set refresh token in cookie
          res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
          });
          
          // Return user info and access token
          const { password, ...userWithoutPassword } = user;
          res.json({
            user: userWithoutPassword,
            accessToken
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Refresh token
router.post('/refresh-token', (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }
  
  try {
    // Verify refresh token
    jwt.verify(
      refreshToken, 
      process.env.JWT_REFRESH_SECRET || 'your_refresh_secret',
      (err, decoded) => {
        if (err) {
          return res.status(403).json({ error: 'Invalid refresh token' });
        }
        
        // Check if token exists in database
        db.get(
          "SELECT * FROM sessions WHERE refresh_token = ? AND expires_at > CURRENT_TIMESTAMP",
          [refreshToken],
          (err, session) => {
            if (err || !session) {
              return res.status(403).json({ error: 'Invalid session' });
            }
            
            // Get user details
            db.get("SELECT * FROM users WHERE id = ?", [decoded.id], (err, user) => {
              if (err || !user) {
                return res.status(403).json({ error: 'User not found' });
              }
              
              // Generate new access token
              const accessToken = jwt.sign(
                { id: user.id, role: user.role },
                process.env.JWT_SECRET || 'your_jwt_secret',
                { expiresIn: '15m' }
              );
              
              const { password, ...userWithoutPassword } = user;
              res.json({
                user: userWithoutPassword,
                accessToken
              });
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Logout user
router.post('/logout', (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (refreshToken) {
      // Delete session from database
      db.run("DELETE FROM sessions WHERE refresh_token = ?", [refreshToken]);
    }
    
    // Clear cookie
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user (protected route)
router.get('/me', authenticateToken, (req, res) => {
  db.get("SELECT * FROM users WHERE id = ?", [req.user.id], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
});

module.exports = router;
