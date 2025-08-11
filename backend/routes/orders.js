const express = require('express');
const router = express.Router();
const db = require('../db'); // adjust to your DB module
const rateLimit = require('express-rate-limit');

// Rate limiter: max 20 requests per 15 minutes per IP for bulk orders
const bulkOrderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: { error: 'Too many bulk order requests, please try again later.' }
});

router.post('/bulk', bulkOrderLimiter, async (req, res) => {
  const orders = req.body.orders;

  if (!Array.isArray(orders) || orders.length === 0) {
    return res.status(400).json({ error: 'Invalid order list' });
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
    console.error('Bulk order error:', err);
    res.status(500).json({ error: 'Failed to process bulk order' });
  }
});

module.exports = router;