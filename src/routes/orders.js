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

// GET /api/makeline/stats
router.get('/stats', async (req, res) => {
  try {
    const db = getDB();
    const collection = db.collection('makeline_orders');

    const [received, processing, completed, failed, total] = await Promise.all([
      collection.countDocuments({ status: 'received' }),
      collection.countDocuments({ status: 'processing' }),
      collection.countDocuments({ status: 'completed' }),
      collection.countDocuments({ status: 'failed' }),
      collection.countDocuments({})
    ]);

    res.json({
      total,
      received,
      processing,
      completed,
      failed
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/makeline/:orderId
router.get('/:orderId', async (req, res) => {
  try {
    const db = getDB();
    const { orderId } = req.params;

    const order = await db
      .collection('makeline_orders')
      .findOne({ orderId });

    if (!order) {
      return res.status(404).json({ error: 'Makeline order not found' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;