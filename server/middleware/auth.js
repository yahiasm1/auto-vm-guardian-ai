
const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret', (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    
    req.user = decoded;
    next();
  });
};

// Middleware to check user role
const authorizeRoles = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (roles.length && !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles
};
