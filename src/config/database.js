/**
 * Configuração e inicialização do banco de dados relacional SQLite3.
 * Define a estrutura das tabelas 'fornecedores' e 'produtos' garantindo
 * integridade referencial por chave estrangeira.
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Caminho absoluto para a criação do arquivo do banco de dados na raiz do projeto
const dbPath = path.resolve(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erro ao conectar ao SQLite:', err.message);
    } else {
        console.log('Banco de dados SQLite conectado com sucesso.');
    }
});

// Execução sequencial para criação e configuração das tabelas
db.serialize(() => {
    // Habilita o suporte a restrições de Foreign Key no SQLite
    db.run('PRAGMA foreign_keys = ON');

    // Tabela de Fornecedores: impede CNPJs duplicados com restrição UNIQUE
    db.run(`
        CREATE TABLE IF NOT EXISTS fornecedores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            razao_social TEXT NOT NULL,
            nome_fantasia TEXT,
            cnpj TEXT UNIQUE NOT NULL,
            telefone TEXT,
            email TEXT,
            endereco TEXT
        )
    `);

    // Tabela de Produtos: exige vínculo com fornecedor e impede preços/quantidades negativas
    db.run(`
        CREATE TABLE IF NOT EXISTS produtos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            codigo TEXT UNIQUE NOT NULL,
            categoria TEXT NOT NULL,
            descricao TEXT,
            preco REAL NOT NULL CHECK(preco >= 0),
            quantidade INTEGER NOT NULL CHECK(quantidade >= 0),
            fornecedor_id INTEGER NOT NULL,
            FOREIGN KEY (fornecedor_id) REFERENCES fornecedores(id) ON DELETE RESTRICT
        )
    `);
});

module.exports = db;