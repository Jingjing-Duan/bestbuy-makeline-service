const { getChannel } = require('./rabbitmq');
const { getDB } = require('./db');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startWorker() {
  const channel = getChannel();
  const db = getDB();

  const queue = process.env.ORDER_QUEUE || 'order.created';
  const orders = db.collection('makeline_orders');

  await channel.assertQueue(queue, {
    durable: true
  });

  // 一次只拿一条，避免一个 worker 压太多未完成消息
  await channel.prefetch(1);

  console.log(`👂 Listening to queue: ${queue}`);

  channel.consume(queue, async (msg) => {
    if (!msg) return;

    try {
      const content = msg.content.toString();
      const order = JSON.parse(content);

      console.log('📥 Order received:', order);

      const now = new Date();

      // 先保存/更新为 received
      await orders.updateOne(
        { orderId: order.orderId },
        {
          $set: {
            orderId: order.orderId,
            customerName: order.customerName || '',
            items: order.items || [],
            total: order.total || 0,
            status: 'received',
            receivedAt: now,
            updatedAt: now
          }
        },
        { upsert: true }
      );

      // 模拟处理
      await orders.updateOne(
        { orderId: order.orderId },
        {
          $set: {
            status: 'processing',
            updatedAt: new Date()
          }
        }
      );

      console.log(`⚙️ Processing order ${order.orderId}...`);
      await sleep(3000);

      await orders.updateOne(
        { orderId: order.orderId },
        {
          $set: {
            status: 'completed',
            completedAt: new Date(),
            updatedAt: new Date()
          }
        }
      );

      console.log(`✅ Order completed: ${order.orderId}`);

      // 手动 ack，处理成功后再确认
      channel.ack(msg);
    } catch (err) {
      console.error('❌ Worker error:', err.message);

      // 不重复塞回队列，先避免无限死循环
      channel.nack(msg, false, false);
    }
  }, {
    noAck: false
  });
}

module.exports = {
  startWorker
};