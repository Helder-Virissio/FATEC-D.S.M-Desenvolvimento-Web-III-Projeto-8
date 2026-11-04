/**
 * Controller responsável pela gestão do catálogo de Produtos.
 * Controla estoque, relacionamentos e validações de preço e quantidade.
 */
const db = require('../config/database');

/**
 * Listagem de todos os produtos com junção (JOIN) para trazer o nome da Razão Social do Fornecedor.
 * GET /api/produtos
 */
exports.listar = (req, res) => {
    const sql = `
        SELECT p.*, f.razao_social as fornecedor_nome 
        FROM produtos p 
        JOIN fornecedores f ON p.fornecedor_id = f.id 
        ORDER BY p.id DESC
    `;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ erro: 'Erro ao buscar produtos.' });
        res.status(200).json(rows);
    });
};

/**
 * Consulta um produto por ID.
 * GET /api/produtos/:id
 */
exports.consultar = (req, res) => {
    const { id } = req.params;
    const sql = `
        SELECT p.*, f.razao_social as fornecedor_nome 
        FROM produtos p 
        JOIN fornecedores f ON p.fornecedor_id = f.id 
        WHERE p.id = ?
    `;
    db.get(sql, [id], (err, row) => {
        if (err) return res.status(500).json({ erro: 'Erro ao buscar produto.' });
        if (!row) return res.status(404).json({ erro: 'Produto não encontrado.' });
        res.status(200).json(row);
    });
};

/**
 * Cadastra um novo produto no estoque.
 * POST /api/produtos
 */
exports.cadastrar = (req, res) => {
    const { nome, codigo, categoria, descricao, preco, quantidade, fornecedor_id } = req.body;

    // Validação de presença de todos os campos obrigatórios
    if (!nome || !codigo || !categoria || preco === undefined || quantidade === undefined || !fornecedor_id) {
        return res.status(400).json({ erro: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }

    // Regra de negócio: Preço e Quantidade não podem ser negativos
    if (Number(preco) < 0 || Number(quantidade) < 0) {
        return res.status(400).json({ erro: 'Preço unitário e quantidade não podem possuir valores negativos.' });
    }

    // Validação de existência do fornecedor referenciado
    db.get('SELECT id FROM fornecedores WHERE id = ?', [fornecedor_id], (err, row) => {
        if (err) return res.status(500).json({ erro: 'Erro ao validar o fornecedor.' });
        if (!row) return res.status(404).json({ erro: 'O fornecedor especificado não existe.' });

        const sql = `INSERT INTO produtos (nome, codigo, categoria, descricao, preco, quantidade, fornecedor_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        db.run(sql, [nome, codigo, categoria, descricao, preco, quantidade, fornecedor_id], function(err) {
            if (err) {
                // Tratamento de erro para código único duplicado
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({ erro: 'O código informado para este produto já está em uso.' });
                }
                return res.status(500).json({ erro: 'Erro ao cadastrar produto.' });
            }
            res.status(201).json({ id: this.lastID, nome, codigo, categoria, descricao, preco, quantidade, fornecedor_id });
        });
    });
};

/**
 * Atualiza os dados de um produto existente.
 * PUT /api/produtos/:id
 */
exports.atualizar = (req, res) => {
    const { id } = req.params;
    const { nome, codigo, categoria, descricao, preco, quantidade, fornecedor_id } = req.body;

    if (!nome || !codigo || !categoria || preco === undefined || quantidade === undefined || !fornecedor_id) {
        return res.status(400).json({ erro: 'Todos os campos obrigatórios devem ser preenchidos.' });
    }
    if (Number(preco) < 0 || Number(quantidade) < 0) {
        return res.status(400).json({ erro: 'Preço unitário e quantidade não podem possuir valores negativos.' });
    }

    db.get('SELECT id FROM fornecedores WHERE id = ?', [fornecedor_id], (err, row) => {
        if (err) return res.status(500).json({ erro: 'Erro ao validar o fornecedor.' });
        if (!row) return res.status(404).json({ erro: 'O fornecedor especificado não existe.' });

        const sql = `UPDATE produtos SET nome = ?, codigo = ?, categoria = ?, descricao = ?, preco = ?, quantidade = ?, fornecedor_id = ? WHERE id = ?`;
        db.run(sql, [nome, codigo, categoria, descricao, preco, quantidade, fornecedor_id, id], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    return res.status(409).json({ erro: 'O código informado já pertence a outro produto.' });
                }
                return res.status(500).json({ erro: 'Erro ao atualizar produto.' });
            }
            if (this.changes === 0) return res.status(404).json({ erro: 'Produto não encontrado.' });
            res.status(200).json({ id: Number(id), nome, codigo, categoria, descricao, preco, quantidade, fornecedor_id });
        });
    });
};

/**
 * Exclui um produto do sistema.
 * DELETE /api/produtos/:id
 */
exports.excluir = (req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM produtos WHERE id = ?', [id], function(err) {
        if (err) return res.status(500).json({ erro: 'Erro ao excluir produto.' });
        if (this.changes === 0) return res.status(404).json({ erro: 'Produto não encontrado.' });
        res.status(200).json({ mensagem: 'Produto excluído com sucesso.' });
    });
};