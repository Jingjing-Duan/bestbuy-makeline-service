const { getChannel } = require('./rabbitmq');
const { getDB } = require('./db');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startWorker() {
  const channel = getChannel();
  const db = getDB();

  const exchange = 'order.created';
  const queue = process.env.MAKELINE_QUEUE || 'makeline.queue';
  const orders = db.collection('makeline_orders');

  await channel.assertExchange(exchange, 'fanout', { durable: true });
  await channel.assertQueue(queue, { durable: true });
  await channel.bindQueue(queue, exchange, '');

  await channel.prefetch(1);

  console.log(`👂 Makeline listening on queue: ${queue}`);

  channel.consume(
    queue,
    async (msg) => {
      if (!msg) return;

      try {
        const content = msg.content.toString();
        const order = JSON.parse(content);

        console.log('📥 Order received:', order);

        const now = new Date();
        const orderId = order.orderId || order._id;

        await orders.updateOne(
          { orderId },
          {
            $set: {
              orderId,
              customerName: order.customerName || '',
              items: order.items || [],
              total: order.total || order.totalAmount || 0,
              status: 'received',
              receivedAt: now,
              updatedAt: now
            }
          },
          { upsert: true }
        );

        await orders.updateOne(
          { orderId },
          {
            $set: {
              status: 'processing',
              updatedAt: new Date()
            }
          }
        );

        console.log(`⚙️ Processing order ${orderId}...`);
        await sleep(3000);

        await orders.updateOne(
          { orderId },
          {
            $set: {
              status: 'completed',
              completedAt: new Date(),
              updatedAt: new Date()
            }
          }
        );

        console.log(`✅ Order completed: ${orderId}`);

        channel.ack(msg);
      } catch (err) {
        console.error('❌ Worker error:', err.message);
        channel.nack(msg, false, false);
      }
    },
    {
      noAck: false
    }
  );
}

module.exports = {
  startWorker
};