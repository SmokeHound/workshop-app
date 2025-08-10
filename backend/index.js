const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const orders = require('./models/orders');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

orders.createTables();
app.use('/api', apiRoutes);

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
