
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../db/database');

// Register new user
exports.register = async (req, res) => {
  const { email, password, name, role, department } = req.body;
  
  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  
  try {
    // Check if email already exists
    const existingUser = await query("SELECT * FROM users WHERE email = $1", [email.toLowerCase()]);
    
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email already in use' });
    }
    
    // Hash password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    const userId = uuidv4();
    
    // Insert new user
    await query(
      "INSERT INTO users (id, email, password, name, role, department) VALUES ($1, $2, $3, $4, $5, $6)",
      [userId, email.toLowerCase(), hashedPassword, name, role, department || '']
    );
    
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Login user
exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  try {
    // Find user by email
    const result = await query("SELECT * FROM users WHERE email = $1", [email.toLowerCase()]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const user = result.rows[0];
    
    // Check password
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    // Update last active timestamp
    await query("UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = $1", [user.id]);
    
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
    
    await query(
      "INSERT INTO sessions (user_id, refresh_token, expires_at) VALUES ($1, $2, $3)",
      [user.id, refreshToken, expiresAt]
    );
    
    // Set refresh token in cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    // Return user info and access token
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      user: userWithoutPassword,
      accessToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token required' });
  }
  
  try {
    // Verify refresh token
    jwt.verify(
      refreshToken, 
      process.env.JWT_REFRESH_SECRET || 'your_refresh_secret',
      async (err, decoded) => {
        if (err) {
          return res.status(403).json({ error: 'Invalid refresh token' });
        }
        
        // Check if token exists in database
        const sessionResult = await query(
          "SELECT * FROM sessions WHERE refresh_token = $1 AND expires_at > CURRENT_TIMESTAMP",
          [refreshToken]
        );
        
        if (sessionResult.rows.length === 0) {
          return res.status(403).json({ error: 'Invalid session' });
        }
        
        // Get user details
        const userResult = await query("SELECT * FROM users WHERE id = $1", [decoded.id]);
        
        if (userResult.rows.length === 0) {
          return res.status(403).json({ error: 'User not found' });
        }
        
        const user = userResult.rows[0];
        
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
      }
    );
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Logout user
exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (refreshToken) {
      // Delete session from database
      await query("DELETE FROM sessions WHERE refresh_token = $1", [refreshToken]);
    }
    
    // Clear cookie
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const userResult = await query("SELECT * FROM users WHERE id = $1", [req.user.id]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = userResult.rows[0];
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
