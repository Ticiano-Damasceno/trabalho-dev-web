const express = require('express');
const produtoController = require('../controllers/produtoController');
const validarId = require('../middlewares/validarId');
const router = express.Router();

router.param('id', validarId);

router.post('/', produtoController.criar);
router.get('/:id', produtoController.buscarPorId);
router.put('/:id', produtoController.atualizar);
router.delete('/:id', produtoController.excluir);

module.exports = router;