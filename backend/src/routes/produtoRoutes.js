const express = require('express');
const produtoController = require('../controllers/produtoController');

const router = express.Router();

router.post('/', produtoController.criar);
router.get('/:id', produtoController.buscarPorId);
router.put('/:id', produtoController.atualizar);
router.delete('/:id', produtoController.excluir);

module.exports = router;