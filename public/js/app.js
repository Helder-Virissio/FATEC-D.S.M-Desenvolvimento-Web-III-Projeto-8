/**
 * Script de manipulação do DOM e controle de eventos do front-end.
 */
let produtosCache = [];
let fornecedoresCache = [];

document.addEventListener('DOMContentLoaded', () => {
    carregarFornecedores();
    carregarProdutos();

    // Event Listeners dos Formulários
    document.getElementById('form-cnpj').addEventListener('submit', buscarCNPJ);
    document.getElementById('form-fornecedor').addEventListener('submit', salvarFornecedor);
    document.getElementById('form-produto').addEventListener('submit', salvarProduto);
    document.getElementById('btn-cancelar-fornecedor').addEventListener('click', limparFormFornecedor);
    document.getElementById('btn-cancelar-produto').addEventListener('click', limparFormProduto);

    // Event Listeners dos Filtros
    document.getElementById('busca-nome').addEventListener('input', filtrarProdutos);
    document.getElementById('filtro-categoria').addEventListener('change', filtrarProdutos);
});

/**
 * Exibe caixa de alerta com mensagens do sistema.
 */
function mostrarAlerta(msg, tipo = 'sucesso') {
    const box = document.getElementById('alert-box');
    box.textContent = msg;
    box.className = `alert ${tipo}`;
    setTimeout(() => box.className = 'alert hidden', 4000);
}

/**
 * Realiza consulta externa de CNPJ e preenche o formulário automaticamente.
 */
async function buscarCNPJ(e) {
    e.preventDefault();
    const cnpj = document.getElementById('cnpj-busca').value.replace(/\D/g, '');
    try {
        const data = await Api.buscarBrasilAPI(cnpj);
        document.getElementById('fornecedor-razao').value = data.razao_social || '';
        document.getElementById('fornecedor-fantasia').value = data.nome_fantasia || '';
        document.getElementById('fornecedor-cnpj').value = data.cnpj || cnpj;
        document.getElementById('fornecedor-telefone').value = data.ddd_telefone_1 || '';
        document.getElementById('fornecedor-email').value = data.email || '';
        document.getElementById('fornecedor-endereco').value = `${data.logradouro || ''}, ${data.numero || ''} - ${data.municipio || ''}/${data.uf || ''}`;
        mostrarAlerta('Dados do CNPJ preenchidos automaticamente via BrasilAPI.');
    } catch (err) {
        mostrarAlerta(err.message + ' Preencha os campos manualmente.', 'erro');
    }
}

/**
 * Busca e renderiza a lista de fornecedores.
 */
async function carregarFornecedores() {
    try {
        fornecedoresCache = await Api.getFornecedores();
        renderizarTabelaFornecedores();
        renderizarSelectFornecedores();
    } catch (err) {
        mostrarAlerta(err.message, 'erro');
    }
}

function renderizarTabelaFornecedores() {
    const tbody = document.getElementById('tabela-fornecedores');
    tbody.innerHTML = fornecedoresCache.map(f => `
        <tr>
            <td>${f.id}</td>
            <td>${f.razao_social}</td>
            <td>${f.cnpj}</td>
            <td>${f.telefone || '-'}</td>
            <td>
                <button class="btn edit" onclick="editarFornecedor(${f.id})">Editar</button>
                <button class="btn danger" onclick="excluirFornecedor(${f.id})">Excluir</button>
            </td>
        </tr>
    `).join('');
}

function renderizarSelectFornecedores() {
    const select = document.getElementById('produto-fornecedor');
    select.innerHTML = '<option value="">Selecione o Fornecedor *</option>' +
        fornecedoresCache.map(f => `<option value="${f.id}">${f.razao_social}</option>`).join('');
}

/**
 * Cria ou atualiza um fornecedor via API REST.
 */
async function salvarFornecedor(e) {
    e.preventDefault();
    const id = document.getElementById('fornecedor-id').value;
    const dados = {
        razao_social: document.getElementById('fornecedor-razao').value,
        nome_fantasia: document.getElementById('fornecedor-fantasia').value,
        cnpj: document.getElementById('fornecedor-cnpj').value,
        telefone: document.getElementById('fornecedor-telefone').value,
        email: document.getElementById('fornecedor-email').value,
        endereco: document.getElementById('fornecedor-endereco').value
    };

    try {
        if (id) {
            await Api.putFornecedor(id, dados);
            mostrarAlerta('Fornecedor atualizado com sucesso.');
        } else {
            await Api.postFornecedor(dados);
            mostrarAlerta('Fornecedor cadastrado com sucesso.');
        }
        limparFormFornecedor();
        carregarFornecedores();
    } catch (err) {
        mostrarAlerta(err.message, 'erro');
    }
}

function editarFornecedor(id) {
    const f = fornecedoresCache.find(item => item.id === id);
    if (!f) return;
    document.getElementById('fornecedor-id').value = f.id;
    document.getElementById('fornecedor-razao').value = f.razao_social;
    document.getElementById('fornecedor-fantasia').value = f.nome_fantasia || '';
    document.getElementById('fornecedor-cnpj').value = f.cnpj;
    document.getElementById('fornecedor-telefone').value = f.telefone || '';
    document.getElementById('fornecedor-email').value = f.email || '';
    document.getElementById('fornecedor-endereco').value = f.endereco || '';
    document.getElementById('btn-cancelar-fornecedor').classList.remove('hidden');
}

/**
 * Confirma e executa a exclusão de fornecedor.
 */
async function excluirFornecedor(id) {
    if (!confirm('Deseja realmente excluir este fornecedor?')) return;
    try {
        await Api.deleteFornecedor(id);
        mostrarAlerta('Fornecedor excluído com sucesso.');
        carregarFornecedores();
    } catch (err) {
        mostrarAlerta(err.message, 'erro');
    }
}

function limparFormFornecedor() {
    document.getElementById('form-fornecedor').reset();
    document.getElementById('fornecedor-id').value = '';
    document.getElementById('btn-cancelar-fornecedor').classList.add('hidden');
}

/**
 * Busca e renderiza a lista de produtos no estoque.
 */
async function carregarProdutos() {
    try {
        produtosCache = await Api.getProdutos();
        renderizarTabelaProdutos(produtosCache);
        atualizarCategorias();
        calcularTotalEstoque();
    } catch (err) {
        mostrarAlerta(err.message, 'erro');
    }
}

/**
 * Renderiza a tabela de produtos aplicando a classe visual de estoque baixo se quantidade < 5.
 */
function renderizarTabelaProdutos(lista) {
    const tbody = document.getElementById('tabela-produtos');
    tbody.innerHTML = lista.map(p => {
        const estoqueBaixo = p.quantidade < 5 ? 'estoque-baixo' : '';
        return `
            <tr class="${estoqueBaixo}">
                <td>${p.id}</td>
                <td>${p.codigo}</td>
                <td>${p.nome}</td>
                <td>${p.categoria}</td>
                <td>R$ ${Number(p.preco).toFixed(2)}</td>
                <td>${p.quantidade}</td>
                <td>${p.fornecedor_nome}</td>
                <td>
                    <button class="btn edit" onclick="editarProduto(${p.id})">Editar</button>
                    <button class="btn danger" onclick="excluirProduto(${p.id})">Excluir</button>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Cria ou atualiza um produto via API REST.
 */
async function salvarProduto(e) {
    e.preventDefault();
    const id = document.getElementById('produto-id').value;
    const dados = {
        nome: document.getElementById('produto-nome').value,
        codigo: document.getElementById('produto-codigo').value,
        categoria: document.getElementById('produto-categoria').value,
        preco: parseFloat(document.getElementById('produto-preco').value),
        quantidade: parseInt(document.getElementById('produto-quantidade').value),
        fornecedor_id: parseInt(document.getElementById('produto-fornecedor').value),
        descricao: document.getElementById('produto-descricao').value
    };

    try {
        if (id) {
            await Api.putProduto(id, dados);
            mostrarAlerta('Produto atualizado com sucesso.');
        } else {
            await Api.postProduto(dados);
            mostrarAlerta('Produto cadastrado com sucesso.');
        }
        limparFormProduto();
        carregarProdutos();
    } catch (err) {
        mostrarAlerta(err.message, 'erro');
    }
}

function editarProduto(id) {
    const p = produtosCache.find(item => item.id === id);
    if (!p) return;
    document.getElementById('produto-id').value = p.id;
    document.getElementById('produto-nome').value = p.nome;
    document.getElementById('produto-codigo').value = p.codigo;
    document.getElementById('produto-categoria').value = p.categoria;
    document.getElementById('produto-preco').value = p.preco;
    document.getElementById('produto-quantidade').value = p.quantidade;
    document.getElementById('produto-fornecedor').value = p.fornecedor_id;
    document.getElementById('produto-descricao').value = p.descricao || '';
    document.getElementById('btn-cancelar-produto').classList.remove('hidden');
}

/**
 * Confirma e executa a exclusão de um produto.
 */
async function excluirProduto(id) {
    if (!confirm('Deseja realmente excluir este produto?')) return;
    try {
        await Api.deleteProduto(id);
        mostrarAlerta('Produto excluído com sucesso.');
        carregarProdutos();
    } catch (err) {
        mostrarAlerta(err.message, 'erro');
    }
}

function limparFormProduto() {
    document.getElementById('form-produto').reset();
    document.getElementById('produto-id').value = '';
    document.getElementById('btn-cancelar-produto').classList.add('hidden');
}

/**
 * Filtra dinamicamente os produtos exibidos por nome e por categoria.
 */
function filtrarProdutos() {
    const busca = document.getElementById('busca-nome').value.toLowerCase();
    const categoria = document.getElementById('filtro-categoria').value;

    const filtrados = produtosCache.filter(p => {
        const matchNome = p.nome.toLowerCase().includes(busca);
        const matchCat = categoria === '' || p.categoria === categoria;
        return matchNome && matchCat;
    });

    renderizarTabelaProdutos(filtrados);
}

/**
 * Popula dinamicamente as categorias no filtro select com base nos itens cadastrados.
 */
function atualizarCategorias() {
    const select = document.getElementById('filtro-categoria');
    const categorias = [...new Set(produtosCache.map(p => p.categoria))];
    select.innerHTML = '<option value="">Todas as Categorias</option>' +
        categorias.map(c => `<option value="${c}">${c}</option>`).join('');
}

/**
 * Calcula o valor total do estoque: SOMA DE (PREÇO UNITÁRIO × QUANTIDADE) DE TODOS OS PRODUTOS.
 */
function calcularTotalEstoque() {
    const total = produtosCache.reduce((acc, p) => acc + (p.preco * p.quantidade), 0);
    document.getElementById('valor-total-estoque').textContent = `R$ ${total.toFixed(2)}`;
}