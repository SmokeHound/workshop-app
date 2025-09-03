const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Example user store (replace with DB)
const users = [
  {
    username: 'admin',
    // Derive once at boot for dev; replace with DB lookups in prod.
    passwordHash: require('bcrypt').hashSync(
      process.env.DEV_ADMIN_PASSWORD || 'admin123',
      10
    ),
    role: 'admin'
  }
];

// Middleware to verify JWT
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

// POST /api/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
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