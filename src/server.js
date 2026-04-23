require('dotenv').config();

const app = require('./app');
const { connectDB } = require('./db');
const { connectRabbitMQ } = require('./rabbitmq');
const { startWorker } = require('./worker');

const PORT = process.env.PORT || 3003;

async function startServer() {
  try {
    // 1. Connect MongoDB
    await connectDB();
    console.log('✅ MongoDB connected');

    // 2. Connect RabbitMQ
    await connectRabbitMQ();
    console.log('✅ RabbitMQ connected');

    // 3. Start worker
    await startWorker();
    console.log('✅ Makeline worker started');

    console.log('CI/CD Demo');

    // 4. Start API server
    app.listen(PORT, () => {
      console.log(` Makeline Service running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start service:', err.message);
    process.exit(1);
  }
}

startServer();