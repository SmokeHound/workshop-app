const jwt = require('jsonwebtoken');
const db = require('../db');

/**
 * Express middleware that verifies a JWT from the `Authorization: Bearer <token>` header.
 * 
 * If a valid token is provided, the decoded payload is attached to `req.user` and `next()` is called.
 * Responds with:
 * - 401 if the Authorization header is missing or not a Bearer token,
 * - 500 if the server is misconfigured and `JWT_SECRET` is absent,
 * - 403 if the token fails verification.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');
  
  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: 'Server misconfigured: missing JWT_SECRET' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
}

/**
 * Express middleware that requires specific role(s) to access a route.
 * Must be used after authenticateToken middleware.
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
}

/**
 * Express middleware that logs user actions for audit purposes
 */
function auditLog(action) {
  return (req, res, next) => {
    const originalSend = res.send;
    res.send = function(body) {
      // Only log successful operations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const logMessage = `${action} by ${req.user?.username || 'unknown'} from ${req.ip}`;
        db.run('INSERT INTO logs (ts, message) VALUES (?, ?)', [Date.now(), logMessage], (err) => {
          if (err) console.error('Failed to write audit log:', err);
        });
      }
      originalSend.call(this, body);
    };
    next();
  };
}

module.exports = {
  authenticateToken,
  requireRole,
  auditLog
};