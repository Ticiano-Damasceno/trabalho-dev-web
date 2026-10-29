const express = require('express');
const fornecedorController = require('../controllers/fornecedorController');
const produtoController = require('../controllers/produtoController');
const validarId = require('../middlewares/validarId');
const router = express.Router();

router.param('id', validarId);

router.get('/', fornecedorController.listar);
router.post('/', fornecedorController.criar);
router.get('/:id/produtos', produtoController.listarPorFornecedor);
router.get('/:id', fornecedorController.buscarPorId);
router.put('/:id', fornecedorController.atualizar);
router.delete('/:id', fornecedorController.excluir);

module.exports = router;