require('dotenv').config();

const app = require('./app');
const { connectDB } = require('./db');
const { connectRabbitMQ } = require('./rabbitmq');
const { startWorker } = require('./worker');

const PORT = process.env.PORT || 3003;

async function startServer() {
  try {
    await connectDB();
    await connectRabbitMQ();
    await startWorker();

    app.listen(PORT, () => {
      console.log(`🚀 Makeline Service running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start service:', err);
    process.exit(1);
  }
}

startServer();