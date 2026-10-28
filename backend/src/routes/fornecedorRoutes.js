const express = require('express');
const fornecedorController = require('../controllers/fornecedorController');

const router = express.Router();

router.get('/', fornecedorController.listar);
router.post('/', fornecedorController.criar);

module.exports = router;