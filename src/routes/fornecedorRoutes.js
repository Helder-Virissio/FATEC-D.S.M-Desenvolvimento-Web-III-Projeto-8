/**
 * Mapeamento das rotas HTTP da API REST para a entidade de Fornecedores.
 */
const express = require('express');
const router = express.Router();
const fornecedorController = require('../controllers/fornecedorController');

router.get('/', fornecedorController.listar);
router.get('/:id', fornecedorController.consultar);
router.post('/', fornecedorController.cadastrar);
router.put('/:id', fornecedorController.atualizar);
router.delete('/:id', fornecedorController.excluir);

module.exports = router;