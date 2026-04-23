const { MongoClient } = require('mongodb');

let client;
let db;

async function connectDB() {
  if (db) return db;

  const mongoUrl = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB_NAME || 'bestbuy_makeline';

  console.log('MONGO_URI =', process.env.MONGO_URI);

  client = new MongoClient(mongoUrl);
  await client.connect();

  db = client.db(dbName);
  console.log(`✅ MongoDB connected: ${dbName}`);

  return db;
}

function getDB() {
  if (!db) {
    throw new Error('Database not connected yet.');
  }
  return db;
}

module.exports = {
  connectDB,
  getDB
};