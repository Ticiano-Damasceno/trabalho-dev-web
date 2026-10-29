const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('A variável DATABASE_URL não foi configurada.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  connectionTimeoutMillis: 10000
});

pool.on('error', (error) => {
  console.error('Erro em conexão ociosa com PostgreSQL:', error.code);
});

module.exports = pool;