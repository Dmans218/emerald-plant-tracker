const { Pool } = require('pg');

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || 'plant_user',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'plant_tracker',
  password: process.env.DB_PASSWORD || 'securepassword',
  port: process.env.DB_PORT || 5432,
  // Connection pool settings
  max: 20, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
  connectionTimeoutMillis: 2000, // how long to wait when connecting a new client
};

// Create connection pool
const pool = new Pool(dbConfig);

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('❌ Unexpected error on idle client', err);
  process.exit(-1);
});

// Test connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database successfully');
    await client.query('SELECT NOW()');
    console.log('📊 Database query test passed');
    client.release();
    return true;
  } catch (err) {
    console.error('❌ Database connection error:', err);
    return false;
  }
};

// Query helper function
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log(`🔍 Executed query in ${duration}ms:`, text.substring(0, 50) + '...');
    return res;
  } catch (err) {
    console.error('❌ Query error:', err);
    throw err;
  }
};

// Get a client from the pool for transactions
const getClient = async () => {
  return await pool.connect();
};

// Close all connections
const close = async () => {
  await pool.end();
  console.log('🔒 Database pool closed');
};

module.exports = {
  pool,
  query,
  getClient,
  testConnection,
  close
};
