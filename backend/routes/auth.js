const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Example user store (replace with DB)
if (process.env.NODE_ENV !== 'development' && !process.env.DEV_ADMIN_PASSWORD) {
  throw new Error('DEV_ADMIN_PASSWORD is required outside development');
}
const users = [
  {
    username: 'admin',
    // Derive once at boot for dev; replace with DB lookups in prod.
    passwordHash: bcrypt.hashSync(
      process.env.DEV_ADMIN_PASSWORD || 'admin123',
      10
    ),
    role: 'admin'
  }
];

/**

 * Express middleware that verifies a Bearer JWT from the Authorization header.
 *
 * Checks for a "Bearer <token>" authorization header and verifies the token using
 * process.env.JWT_SECRET. On success the decoded token payload is attached to
 * req.user and next() is called.
 *
 * Behavior:
 * - Responds 401 if the header is missing or not a Bearer token.
 * - Responds 500 with a JSON error if JWT_SECRET is not configured.
 * - Responds 403 if token verification fails.
 *
 * Side effect: sets req.user to the decoded JWT payload on successful verification.
======
 * Express middleware that verifies a JWT from the `Authorization: Bearer <token>` header.
 *
 * If a valid token is provided, the decoded payload is attached to `req.user` and `next()` is called.
 * Responds with:
 * - 401 if the Authorization header is missing or not a Bearer token,
 * - 500 if the server is misconfigured and `JWT_SECRET` is absent,
 * - 403 if the token fails verification.

 */
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) return res.sendStatus(401);
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: 'Server misconfigured: missing JWT_SECRET' });
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

const rateLimit = require('express-rate-limit');
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false
});
const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false
});

// POST /api/login
router.post('/login', loginLimiter, async (req, res) => {

// Apply sensitiveLimiter to all admin and user management routes
router.use(['/me', '/users', '/users/export', '/users/import', '/users/:id', '/apikeys', '/roles', '/announcements', '/logs'], sensitiveLimiter);
  const { username, password } = req.body;
  if (typeof username !== 'string' || typeof password !== 'string' || !username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.json({ user: user.username, role: user.role, token });
});

// GET /api/me
router.get('/me', authMiddleware, (req, res) => {
  res.json({ username: req.user.username, role: req.user.role });
});

module.exports = router;
module.exports.authMiddleware = authMiddleware;