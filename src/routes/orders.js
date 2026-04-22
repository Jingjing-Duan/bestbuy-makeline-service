const express = require('express');
const router = express.Router();
const { getDB } = require('../db');

router.get('/', async (req, res) => {
  try {
    const db = getDB();
    const orders = await db
      .collection('makeline_orders')
      .find({})
      .sort({ receivedAt: -1 })
      .toArray();

    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;