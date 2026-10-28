const express = require('express');
const swaggerUi = require('swagger-ui-express');

const openapi = require('./docs/openapi');
const fornecedorRoutes = require('./routes/fornecedorRoutes');

const app = express();

app.use(express.json());

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));

app.get('/', (req, res) => {
  res.json({
    mensagem: 'API do Mercadinho São José funcionando!'
  });
});

app.use('/fornecedores', fornecedorRoutes);

module.exports = app;