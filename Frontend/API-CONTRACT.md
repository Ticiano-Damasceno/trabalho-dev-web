# Contrato esperado da API

O frontend inicia em modo local. Para conectar o backend, ajuste `useApi` e `apiBaseUrl` em `config.js`. Este projeto prepara o cliente e o contrato, mas não inclui nem inicia um servidor de API.

Em modo API, todas as rotas usam JSON e autenticação por cookie de sessão `HttpOnly` (`credentials: include`). O servidor deve permitir CORS com credenciais para a origem do frontend e proteger operações mutáveis contra CSRF. O frontend não salva tokens de autenticação no `localStorage`.

## Endpoints

| Método | Rota | Resposta esperada |
|---|---|---|
| GET | `/auth/session` | `{ "authenticated": true }`; `401` quando não houver sessão |
| POST | `/auth/login` | Recebe `{ "username": "...", "password": "..." }` e inicia sessão |
| POST | `/auth/logout` | Encerra a sessão |
| GET | `/suppliers` | Lista de fornecedores |
| POST | `/suppliers` | Recebe `{ "name": "...", "cnpj": "14 dígitos" }`; retorna o fornecedor criado |
| PUT | `/suppliers/:id` | Recebe `{ "name": "...", "cnpj": "14 dígitos" }`; retorna o fornecedor atualizado |
| DELETE | `/suppliers/:id` | Remove fornecedor sem produtos; use `409` se houver produtos vinculados |
| GET | `/products` | Lista de produtos |
| POST | `/products` | Recebe `{ "supplierId": "...", "name": "...", "price": 0.01, "stock": 0 }`; retorna o produto criado |
| PUT | `/products/:id` | Recebe `{ "supplierId": "...", "name": "...", "price": 0.01, "stock": 0 }`; retorna o produto atualizado |
| DELETE | `/products/:id` | Remove o produto |
| GET | `/sales` | Lista de vendas com `id`, `productId`, `productName`, `quantity`, `unitPrice` e `date` (`AAAA-MM-DD`) |
| POST | `/sales` | Recebe `{ "productId": "...", "quantity": 1, "date": "AAAA-MM-DD" }`; retorna a venda criada |

O backend deve validar permissões e regras de negócio mesmo que o frontend também valide. Em especial, a criação da venda deve conferir e descontar o estoque atomicamente e responder com `409` quando não houver unidades suficientes. Erros devem retornar JSON no formato `{ "message": "Descrição do erro" }`.
