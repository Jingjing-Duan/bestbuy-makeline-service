const express = require('express');
const cors = require('cors');
const orderRoutes = require('./routes/orders');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Makeline Service is running');
});

app.use('/api/orders', orderRoutes);

module.exports = app;