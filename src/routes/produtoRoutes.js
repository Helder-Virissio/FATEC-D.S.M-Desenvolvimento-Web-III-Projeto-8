/**
 * Mapeamento das rotas HTTP da API REST para a entidade de Produtos.
 */
const express = require('express');
const router = express.Router();
const produtoController = require('../controllers/produtoController');

router.get('/', produtoController.listar);
router.get('/:id', produtoController.consultar);
router.post('/', produtoController.cadastrar);
router.put('/:id', produtoController.atualizar);
router.delete('/:id', produtoController.excluir);

module.exports = router;