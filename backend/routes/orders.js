const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticateToken } = require('../middleware/auth');

const rateLimit = require('express-rate-limit');
const bulkLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 60,                 // limit each IP to 60 requests per windowMs
  standardHeaders: true,   // return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false     // disable the `X-RateLimit-*` headers
});

// POST /api/orders/bulk
router.post('/bulk', authenticateToken, bulkLimiter, async (req, res) => {
  const orders = req.body.orders;
  if (!Array.isArray(orders) || orders.length === 0 || orders.length > 500) {
    return res.status(400).json({ error: 'Invalid order list' });
  }

  for (const o of orders) {
    const { code, description, quantity } = o || {};
    if (
      typeof code !== 'string' || !code.trim() ||
      typeof description !== 'string' || !description.trim() ||
      !Number.isInteger(quantity) || quantity <= 0
    ) {
      return res.status(400).json({ error: 'Invalid order item' });
    }
  }

  try {
    for (const { code, description, quantity } of orders) {
      await db.run(
        `INSERT INTO orders (item_code, description, quantity, timestamp) VALUES (?, ?, ?, ?)`,
        [code, description, quantity, Date.now()]
      );
    }
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process bulk order' });
  }
});

module.exports = router;
