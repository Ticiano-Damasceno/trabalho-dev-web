const { Pool } = require('pg');
const { attachDatabasePool } = require('@vercel/functions');

if (!process.env.DATABASE_URL) {
  throw new Error('A variável DATABASE_URL não foi configurada.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 5000
});

if (process.env.VERCEL) {
  attachDatabasePool(pool);
}

pool.on('error', (error) => {
  console.error('Erro em conexão ociosa com PostgreSQL:', error.code);
});

module.exports = pool;