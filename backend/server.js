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
app.use(express.json({ limit: '2000kb' }));

// Add Content Security Policy header
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net; style-src 'self' https://cdn.jsdelivr.net;");
  next();
});

// Standardize error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Mount routes
app.use('/api', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/consumables', require('./routes/consumables'));
app.use('/api/admin', require('./routes/admin'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));