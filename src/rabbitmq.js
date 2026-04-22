const amqp = require('amqplib');

let connection;
let channel;

async function connectRabbitMQ() {
  if (channel) return channel;

  const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
  connection = await amqp.connect(rabbitUrl);
  channel = await connection.createChannel();

  console.log('✅ RabbitMQ connected');
  return channel;
}

function getChannel() {
  if (!channel) {
    throw new Error('RabbitMQ channel not connected yet.');
  }
  return channel;
}

module.exports = {
  connectRabbitMQ,
  getChannel
};