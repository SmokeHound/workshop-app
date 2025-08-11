const express = require('express');
const router = express.Router();
const consumables = require('../data/consumables.json');

router.get('/', (req, res) => {
  res.json(consumables);
});

module.exports = router;