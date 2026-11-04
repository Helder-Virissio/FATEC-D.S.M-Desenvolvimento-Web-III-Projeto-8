/**
 * Servidor HTTP principal da aplicação Express.
 * Registra middlewares, rotas estáticas e rotas de API.
 */
const express = require('express');
const path = require('path');
const fornecedorRoutes = require('./src/routes/fornecedorRoutes');
const produtoRoutes = require('./src/routes/produtoRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares para parsing de requisições em formato JSON e Form-URL-Encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servidor de arquivos estáticos da interface web (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Registro dos endpoints da API REST
app.use('/api/fornecedores', fornecedorRoutes);
app.use('/api/produtos', produtoRoutes);

// Tratamento centralizado para rotas inexistentes (Middleware 404)
app.use((req, res) => {
    res.status(404).json({ erro: 'Rota inexistente ou método HTTP não suportado.' });
});

// Inicialização da aplicação
app.listen(PORT, () => {
    console.log(`Servidor de Controle de Estoque rodando em http://localhost:${PORT}`);
});