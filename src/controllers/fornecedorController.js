/**
 * Controller responsável pela lógica de negócios da entidade Fornecedor.
 * Implementa o CRUD completo com validações de regras de negócio e tratamento de erros.
 */
const db = require('../config/database');

/**
 * Retorna todos os fornecedores cadastrados.
 * GET /api/fornecedores
 */
exports.listar = (req, res) => {
    db.all('SELECT * FROM fornecedores ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(500).json({ erro: 'Erro ao buscar fornecedores no banco de dados.' });
        res.status(200).json(rows);
    });
};

/**
 * Consulta um fornecedor específico pelo seu ID.
 * GET /api/fornecedores/:id
 */
exports.consultar = (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM fornecedores WHERE id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ erro: 'Erro ao buscar fornecedor.' });
        if (!row) return res.status(404).json({ erro: 'Fornecedor não encontrado.' });
        res.status(200).json(row);
    });
};

/**
 * Cadastra um novo fornecedor.
 * POST /api/fornecedores
 */
exports.cadastrar = (req, res) => {
    const { razao_social, nome_fantasia, cnpj, telefone, email, endereco } = req.body;

    // Validação de campos obrigatórios
    if (!razao_social || !cnpj) {
        return res.status(400).json({ erro: 'Razão Social e CNPJ são campos obrigatórios.' });
    }

    const sql = `INSERT INTO fornecedores (razao_social, nome_fantasia, cnpj, telefone, email, endereco) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(sql, [razao_social, nome_fantasia, cnpj, telefone, email, endereco], function(err) {
        if (err) {
            // Tratamento de unicidade de CNPJ
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ erro: 'CNPJ já cadastrado no sistema.' });
            }
            return res.status(500).json({ erro: 'Erro ao cadastrar fornecedor.' });
        }
        res.status(201).json({ id: this.lastID, razao_social, nome_fantasia, cnpj, telefone, email, endereco });
    });
};

/**
 * Atualiza um fornecedor existente.
 * PUT /api/fornecedores/:id
 */
exports.atualizar = (req, res) => {
    const { id } = req.params;
    const { razao_social, nome_fantasia, cnpj, telefone, email, endereco } = req.body;

    if (!razao_social || !cnpj) {
        return res.status(400).json({ erro: 'Razão Social e CNPJ são campos obrigatórios.' });
    }

    const sql = `UPDATE fornecedores SET razao_social = ?, nome_fantasia = ?, cnpj = ?, telefone = ?, email = ?, endereco = ? WHERE id = ?`;
    db.run(sql, [razao_social, nome_fantasia, cnpj, telefone, email, endereco, id], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(409).json({ erro: 'CNPJ já em uso por outro fornecedor.' });
            }
            return res.status(500).json({ erro: 'Erro ao atualizar fornecedor.' });
        }
        if (this.changes === 0) return res.status(404).json({ erro: 'Fornecedor não encontrado.' });
        res.status(200).json({ id: Number(id), razao_social, nome_fantasia, cnpj, telefone, email, endereco });
    });
};

/**
 * Exclui um fornecedor.
 * Impede a exclusão caso o fornecedor possua produtos vinculados.
 * DELETE /api/fornecedores/:id
 */
exports.excluir = (req, res) => {
    const { id } = req.params;

    // Verificação de vínculo com a tabela de produtos
    db.get('SELECT COUNT(*) as count FROM produtos WHERE fornecedor_id = ?', [id], (err, row) => {
        if (err) return res.status(500).json({ erro: 'Erro ao verificar vínculos do fornecedor.' });
        if (row.count > 0) {
            return res.status(400).json({ erro: 'Não é possível excluir fornecedores que possuem produtos vinculados.' });
        }

        db.run('DELETE FROM fornecedores WHERE id = ?', [id], function(err) {
            if (err) return res.status(500).json({ erro: 'Erro ao excluir fornecedor.' });
            if (this.changes === 0) return res.status(404).json({ erro: 'Fornecedor não encontrado.' });
            res.status(200).json({ mensagem: 'Fornecedor excluído com sucesso.' });
        });
    });
};