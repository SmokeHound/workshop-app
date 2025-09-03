const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const allowlist = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
app.use(
  cors({
    origin: allowlist.length ? allowlist : false,
    credentials: true
  })
);
app.use(helmet());
app.use(express.json({ limit: '200kb' }));
// Mount routes
app.use('/api', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/consumables', require('./routes/consumables'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));