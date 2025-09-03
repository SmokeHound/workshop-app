const express = require('express');
const router = express.Router();
const db = require('../db');
const { authMiddleware } = require('./auth'); // export it from auth.js if you want protection

// POST /api/orders/bulk
router.post('/bulk', authMiddleware, async (req, res) => {
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
    console.error(err);
    res.status(500).json({ error: 'Failed to process bulk order' });
  }
});

module.exports = router;