const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5438'),
  database: process.env.DB_NAME || 'electrician_db',
  user: process.env.DB_USER || 'electrician',
  password: process.env.DB_PASSWORD || '',
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('[MCP DB] Unexpected pool error:', err.message);
});

module.exports = pool;
