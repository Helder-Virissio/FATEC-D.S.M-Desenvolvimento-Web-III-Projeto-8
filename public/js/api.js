/**
 * Módulo de comunicação com as APIs através da Fetch API.
 * Encapsula os chamados HTTP para a API REST local e a API externa BrasilAPI.
 */
const API_BASE = '/api';

/**
 * Função utilitária para abstrair requisições HTTP e tratamento de erros.
 */
async function request(url, options = {}) {
    const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.erro || 'Ocorreu um erro na requisição.');
    }
    return data;
}

const Api = {
    // Endpoints de Fornecedores
    getFornecedores: () => request(`${API_BASE}/fornecedores`),
    getFornecedor: (id) => request(`${API_BASE}/fornecedores/${id}`),
    postFornecedor: (dados) => request(`${API_BASE}/fornecedores`, { method: 'POST', body: JSON.stringify(dados) }),
    putFornecedor: (id, dados) => request(`${API_BASE}/fornecedores/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),
    deleteFornecedor: (id) => request(`${API_BASE}/fornecedores/${id}`, { method: 'DELETE' }),

    // Endpoints de Produtos
    getProdutos: () => request(`${API_BASE}/produtos`),
    getProduto: (id) => request(`${API_BASE}/produtos/${id}`),
    postProduto: (dados) => request(`${API_BASE}/produtos`, { method: 'POST', body: JSON.stringify(dados) }),
    putProduto: (id, dados) => request(`${API_BASE}/produtos/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),
    deleteProduto: (id) => request(`${API_BASE}/produtos/${id}`, { method: 'DELETE' }),

    // Integração Externa com BrasilAPI
    buscarBrasilAPI: async (cnpj) => {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
        if (!response.ok) throw new Error('CNPJ não encontrado na BrasilAPI.');
        return await response.json();
    }
};