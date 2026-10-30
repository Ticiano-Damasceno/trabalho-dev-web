const cors = require('cors');

const origensPermitidas = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origem) => origem.trim())
  .filter(Boolean);

module.exports = cors({
  origin: origensPermitidas,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  optionsSuccessStatus: 204
});