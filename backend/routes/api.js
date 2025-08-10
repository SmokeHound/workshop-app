const express = require('express');
const router = express.Router();
const db = require('../db'); // Assuming you're using a SQLite DB instance

// 🛍 Get all stock items
router.get('/items', async (req, res) => {
  try {
    const items = await db.all('SELECT * FROM items');
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

// 🆕 Add a new item
router.post('/items', async (req, res) => {
  const { name, quantity, price } = req.body;
  try {
    await db.run(
      'INSERT INTO items (name, quantity, price) VALUES (?, ?, ?)',
      [name, quantity, price]
    );
    res.status(201).json({ message: 'Item added successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add item' });
  }
});

// ✏️ Update an existing item
router.put('/items/:id', async (req, res) => {
  const { id } = req.params;
  const { name, quantity, price } = req.body;
  try {
    await db.run(
      'UPDATE items SET name = ?, quantity = ?, price = ? WHERE id = ?',
      [name, quantity, price, id]
    );
    res.json({ message: 'Item updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// ❌ Delete an item
router.delete('/items/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.run('DELETE FROM items WHERE id = ?', [id]);
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = router;