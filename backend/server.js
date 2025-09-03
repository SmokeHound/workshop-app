const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Mount routes
app.use('/api', require('./routes/auth'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/consumables', require('./routes/consumables'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));