A proposta passa a ser o **cenário 6 — Mercadinho e seus fornecedores**, mantendo a stack e a estratégia de publicação gratuita.

O sistema permitirá cadastrar fornecedores e controlar os produtos que cada um entrega, incluindo a quantidade em estoque. **Um fornecedor terá vários produtos, e cada produto pertencerá a um único fornecedor**, conforme o PDF. N695_Proposta_de_Trabalho_2026\_…

**1. Funcionalidades e telas**

| Tela | Funcionalidades |
|---|---|
| Lista de fornecedores | Listar, acessar produtos, editar e excluir fornecedor. |
| Cadastro/edição de fornecedor | Preencher e validar os dados do fornecedor. |
| Produtos de um fornecedor | Listar produtos e suas quantidades em estoque, editar e excluir. |
| Cadastro/edição de produto | Cadastrar ou atualizar um produto vinculado ao fornecedor. |

Para manter o escopo enxuto, o estoque será atualizado pelo formulário de edição do produto. Vendas, compras, pagamentos e histórico de movimentações ficam fora da proposta inicial.

**2. Stack proposta**

| Parte | Tecnologia | Finalidade |
|---|---|---|
| Interface | HTML + CSS + Bootstrap | Construção de telas responsivas, tabelas e formulários. |
| Interatividade | JavaScript puro, organizado em módulos | Navegação, validações e atualização das telas. |
| Comunicação com o backend | `fetch`, com dados em JSON | Consumir o serviço Web implementado pela equipe. |
| Serviço Web | Node.js + Express | Implementar operações e regras de negócio. |
| Banco de dados | PostgreSQL no Neon | Armazenar fornecedores e produtos relacionados. |
| Acesso ao banco | Biblioteca `pg` | Executar consultas SQL parametrizadas. |
| Versionamento | Git + GitHub | Organizar o desenvolvimento das três duplas. |

O backend ficará separado em **controladores, serviços e repositórios**, responsáveis por receber requisições, aplicar regras e acessar os dados.

**3. Persistência dos dados**

Proponho duas tabelas:

| Tabela | Campos propostos |
|---|---|
| `fornecedores` | `id`, `nome`, `cnpj`, `telefone`, `email`, `criado_em`, `atualizado_em` |
| `produtos` | `id`, `fornecedor_id`, `nome`, `descricao`, `quantidade_estoque`, `criado_em`, `atualizado_em` |

**Campos obrigatórios propostos:** nome e CNPJ do fornecedor; fornecedor, nome e quantidade em estoque do produto. Telefone, e-mail e descrição serão opcionais.

O CNPJ será armazenado como texto para preservar possíveis zeros iniciais. A quantidade em estoque será um número inteiro, considerando produtos vendidos por unidade.

As validações serão:

| Regra | Implementação proposta |
|---|---|
| Campos obrigatórios | Validar na interface e na API, rejeitando também textos com apenas espaços. |
| CNPJ com 14 dígitos | Remover a pontuação da máscara e verificar exatamente 14 algarismos, conforme o enunciado. |
| Estoque não negativo | Aceitar zero ou números inteiros positivos. |
| Produto vinculado a fornecedor existente | Garantir com validação na API e chave estrangeira no banco. |
| Impedir exclusão de fornecedor com produtos | Bloquear na API e reforçar com `ON DELETE RESTRICT` no banco. |

Exemplo de mensagem: **“Não é possível excluir este fornecedor porque ele possui produtos cadastrados.”**

Os dados ficarão no PostgreSQL, compartilhados entre os usuários e preservados após fechar o navegador. O uso de banco permite disputar a pontuação máxima de rigor técnico prevista no trabalho. N695_Proposta_de_Trabalho_2026\_…

**4. Serviço Web próprio**

A equipe implementará estas rotas:

| Operação | Fornecedores | Produtos |
|---|---|---|
| Criar | `POST /api/fornecedores` | `POST /api/produtos` |
| Listar | `GET /api/fornecedores` | `GET /api/produtos?fornecedor_id=1` |
| Consultar um registro | `GET /api/fornecedores/:id` | `GET /api/produtos/:id` |
| Atualizar | `PUT /api/fornecedores/:id` | `PUT /api/produtos/:id` |
| Excluir | `DELETE /api/fornecedores/:id` | `DELETE /api/produtos/:id` |

As respostas terão mensagens claras para dados inválidos, registros inexistentes e exclusões bloqueadas. A interface exibirá essas mensagens ao usuário.

**5. Publicação gratuita**

Mantemos a distribuição já proposta:

| Parte | Hospedagem |
|---|---|
| Código completo | Repositório público no GitHub |
| Interface | GitHub Pages |
| API Node.js + Express | Vercel, plano Hobby |
| PostgreSQL | Neon, plano Free |

O GitHub Pages hospeda a interface estática; o serviço Web será executado na Vercel e acessará o banco no Neon. O custo previsto continua sendo **R$ 0 dentro dos limites dos planos gratuitos**, para a demonstração acadêmica não comercial. [docs.github.com](https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages?utm_source=chatgpt.com)

A organização do repositório será:

| Pasta | Conteúdo |
|---|---|
| `/frontend` | Páginas, estilos e JavaScript da interface. |
| `/backend` | Rotas, controladores, serviços e repositórios de dados. |
| `/database` | Scripts de criação das tabelas e dados fictícios. |
| `/documentacao` | Evidências, planejamento e material para o PDF. |

A senha do banco ficará somente nas variáveis de ambiente do backend. A API será configurada para permitir chamadas da interface publicada no Pages.

**6. Divisão das atividades em três duplas**

| Dupla | Responsabilidades | Entregas |
|---|---|---|
| **1 — Interface** | Desenvolver telas de fornecedores e produtos, navegação, formulários e integração com a API. | Interface responsiva; mensagens de erro e sucesso; confirmação de exclusão; publicação no Pages; capturas das telas. |
| **2 — Serviço Web** | Implementar as operações das duas entidades, validações e regras de negócio. | API completa; bloqueio de exclusão de fornecedor com produtos; validação de CNPJ e estoque; tratamento de erros; publicação na Vercel. |
| **3 — Persistência e qualidade** | Modelar o banco, implementar acesso aos dados e verificar o funcionamento integrado. | Tabelas e restrições; consultas SQL; dados fictícios; testes das regras; configuração do Neon; consolidação do PDF. |

**Cada dupla documentará sua própria parte**, entregando capturas, links para o código e explicações. A dupla 3 ficará responsável pela montagem final do documento.

Antes de começar, todos devem combinar os campos, as rotas e o formato das respostas. Cada funcionalidade será desenvolvida em uma branch e revisada por outra dupla antes da integração.

**7. Cronograma e entrega**

| Período | Resultado esperado |
|---|---|
| **20–25/10** | Repositório, modelo do banco e primeira tela consultando fornecedores pela API publicada. |
| **26/10–08/11** | Cadastro, listagem, edição e exclusão de fornecedores e produtos. |
| **09–15/11** | Validações completas, tratamento de erros e testes integrados. |
| **16–22/11** | Revisão do código, capturas e elaboração do PDF. |
| **23–26/11** | Conferência final da aplicação, links e documento. |

Nos testes, será essencial demonstrar que **CNPJ inválido e estoque negativo são rejeitados**, que **um fornecedor com produtos não pode ser excluído** e que os dados continuam disponíveis após recarregar a página.

A entrega permanece: **um PDF de 8 a 20 páginas**, seguindo os 13 tópicos obrigatórios, com identificação de todos, links públicos e declaração de uso de IA. Todos devem enviá-lo no AVA até **27/11**, e o sistema e o repositório devem permanecer acessíveis até **10/12**. N695_Proposta_de_Trabalho_2026\_…
