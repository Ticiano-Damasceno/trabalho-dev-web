const express = require('express');
const swaggerUi = require('swagger-ui-express');
const configurarCors = require('./middlewares/configurarCors');
const openapi = require('./docs/openapi');
const fornecedorRoutes = require('./routes/fornecedorRoutes');
const produtoRoutes = require('./routes/produtoRoutes');
const tratamentoErros = require('./middlewares/tratamentoErros');

const app = express();
app.use(configurarCors);
app.use(express.json({ limit: '100kb' }));

app.get(/^\/docs$/, (req, res) => {
  return res.redirect('/docs/');
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi));

app.get('/', (req, res) => {
  res.json({
    mensagem: 'API do Mercadinho São José funcionando!'
  });
});

app.use('/fornecedores', fornecedorRoutes);
app.use('/produtos', produtoRoutes);

app.use((req, res) => {
  return res.status(404).json({
    mensagem: 'Rota não encontrada.'
  });
});

app.use(tratamentoErros);

module.exports = app;