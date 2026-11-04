# 📦 Sistema de Controle de Estoque — Projeto 08 (Web III)

Aplicação web completa para gerenciamento e controle de estoque de produtos, quantidades disponíveis, preços e fornecedores de uma pequena empresa comercial. Desenvolvida para a disciplina de **Desenvolvimento Web III** do curso de **Desenvolvimento de Software Multiplataforma (DSM)** na **FATEC Diadema**.

O sistema implementa CRUD completo para produtos e fornecedores, API REST integrada com o banco de dados relacional SQLite, validação de regras de negócio, tratamento de erros e integração com a API externa **BrasilAPI** para busca automatizada de dados cadastrais por CNPJ.

---

## 🛠️ Tecnologias Utilizadas

- **Backend:** Node.js, Express (API REST sem frameworks de abstração de rotas).
- **Banco de Dados:** SQLite3 (persistência relacional com suporte a chaves estrangeiras e integridade referencial).
- **Frontend:** HTML5, CSS3 e JavaScript nativo (Fetch API, manipulação dinâmica do DOM, sem frameworks frontend).
- **Integração Externa:** [BrasilAPI](https://brasilapi.com.br/docs) (Consulta de dados de CNPJ).

---

## 🚀 Como Instalar e Executar o Projeto

### Pré-requisitos

Antes de começar, você precisará ter o [Node.js](https://nodejs.org/) (versão 18 ou superior) e o [Git](https://git-scm.com/) instalados em sua máquina.

### Passo a Passo

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/Helder-Virissio/FATEC-D.S.M-Desenvolvimento-Web-III-Projeto-8.git
   cd FATEC-D.S.M-Desenvolvimento-Web-III-Projeto-8
   ```

2. **Instalar as dependências:**
   ```bash
   npm install
   ```

3. **Iniciar o servidor de desenvolvimento:**
   ```bash
   npm start
   ```
   *(Caso possua o Nodemon instalado, você também pode utilizar `npm run dev`)*.

4. **Acessar a aplicação:**
   Abra o seu navegador e acesse a URL: `http://localhost:3000`

---

## 📡 Documentação dos Endpoints da API REST

A aplicação disponibiliza uma API RESTful completa que responde em formato **JSON** e utiliza os métodos e códigos de status HTTP apropriados (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, `409 Conflict`, `500 Internal Server Error`).

### 🏢 Fornecedores (`/api/fornecedores`)

| Método | Rota | Descrição | Status HTTP |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/fornecedores` | Retorna a listagem de todos os fornecedores cadastrados. | `200 OK` |
| **GET** | `/api/fornecedores/:id` | Retorna os detalhes de um fornecedor específico por ID. | `200 OK` / `404 Not Found` |
| **POST** | `/api/fornecedores` | Cadastra um novo fornecedor. Impede CNPJs duplicados. | `201 Created` / `400 Bad Request` / `409 Conflict` |
| **PUT** | `/api/fornecedores/:id` | Atualiza os dados do fornecedor especificado pelo ID. | `200 OK` / `400 Bad Request` / `404 Not Found` |
| **DELETE** | `/api/fornecedores/:id` | Remove o fornecedor do sistema. Impede exclusão se houver produtos vinculados. | `200 OK` / `400 Bad Request` / `404 Not Found` |

### 📦 Produtos (`/api/produtos`)

| Método | Rota | Descrição | Status HTTP |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/produtos` | Lista todos os produtos com junção (JOIN) com a razão social do fornecedor. | `200 OK` |
| **GET** | `/api/produtos/:id` | Retorna a consulta detalhada de um produto por ID. | `200 OK` / `404 Not Found` |
| **POST** | `/api/produtos` | Cadastra um novo produto no estoque vinculado a um fornecedor. | `201 Created` / `400 Bad Request` / `409 Conflict` |
| **PUT** | `/api/produtos/:id` | Atualiza os dados de um produto existente por ID. | `200 OK` / `400 Bad Request` / `404 Not Found` |
| **DELETE** | `/api/produtos/:id` | Remove um produto cadastrado do estoque. | `200 OK` / `404 Not Found` |

---

## ⚙️ Regras de Negócio e Funcionalidades

- **Integração BrasilAPI:** Ao digitar o CNPJ no formulário de fornecedores e consultar, o sistema preenche automaticamente os campos de Razão Social, Nome Fantasia, Telefone, E-mail e Endereço. Em caso de falha da API, permite o preenchimento manual.
- **Validação de Unicidade:** O sistema impede o cadastro de CNPJs duplicados para fornecedores e de Códigos duplicados para produtos.
- **Integridade Referencial:** Não é permitida a exclusão de fornecedores que possuem produtos associados.
- **Destaque Visual de Estoque Baixo:** Produtos com quantidade em estoque inferior a **5 unidades** são destacados dinamicamente com alerta visual de cor vermelha na interface.
- **Cálculo Automático do Valor Total do Estoque:** O dashboard no topo da aplicação calcula em tempo real o valor total acumulado no estoque segundo a fórmula:
  $$\text{VALOR TOTAL DO ESTOQUE} = \sum (\text{PREÇO UNITÁRIO} \times \text{QUANTIDADE})$$
- **Validação de Preços e Quantidades:** Não são aceitos valores de preços unitários ou quantidades negativas.
- **Confirmação de Exclusão:** Exige confirmação prévia do usuário antes de realizar a remoção de qualquer registro no banco de dados.

---

## 👥 Autores e Projeto Acadêmico

- **Autor:** Helder Virissio Araujo
- **Curso:** Desenvolvimento de Software Multiplataforma (DSM) — 3º Semestre
- **Instituição:** FATEC Diadema
- **Disciplina:** Desenvolvimento Web III
- **Projeto:** Projeto 08 – Sistema de Controle de Estoque (CRUD + API REST)
