const produtoEntrada = {
    type: 'object',
    required: ['nome', 'quantidade_estoque', 'fornecedor_id'],
    properties: {
        nome: {
            type: 'string',
            minLength: 1,
            pattern: '\\S',
            example: 'Arroz 1 kg'
        },
        descricao: {
            type: 'string',
            nullable: true,
            description:
                'Opcional. Ausente, null ou texto vazio é armazenado como null.',
            example: 'Arroz branco, pacote de 1 kg.'
        },
        quantidade_estoque: {
            type: 'integer',
            minimum: 0,
            maximum: 2147483647,
            example: 10
        },
        fornecedor_id: {
            type: 'integer',
            minimum: 1,
            maximum: 2147483647,
            description: 'Identificador de um fornecedor existente.',
            example: 1
        }
    }
};

const produtoResposta = {
    type: 'object',
    required: [
        'id',
        'fornecedor_id',
        'nome',
        'descricao',
        'quantidade_estoque',
        'criado_em',
        'atualizado_em'
    ],
    properties: {
        id: {
            type: 'integer',
            minimum: 1,
            maximum: 2147483647,
            readOnly: true,
            example: 1
        },
        ...produtoEntrada.properties,
        criado_em: {
            type: 'string',
            format: 'date-time',
            readOnly: true,
            description: 'Data de criação administrada pelo banco.',
            example: '2026-10-30T12:00:00.000Z'
        },
        atualizado_em: {
            type: 'string',
            format: 'date-time',
            readOnly: true,
            description: 'Data da última atualização administrada pelo banco.',
            example: '2026-10-30T13:00:00.000Z'
        }
    }
};

const fornecedorEntrada = {
    type: 'object',
    required: ['nome', 'cnpj'],
    properties: {
        nome: {
            type: 'string',
            minLength: 1,
            pattern: '\\S',
            example: 'Distribuidora Exemplo'
        },
        cnpj: {
            type: 'string',
            minLength: 14,
            maxLength: 14,
            pattern: '^[0-9]{14}$',
            example: '12345678000199'
        },
        telefone: {
            type: 'string',
            nullable: true,
            maxLength: 30,
            description:
                'Opcional. Quando preenchido, deve conter de 10 a 15 dígitos, incluindo DDD. Aceita pontuação. Ausente, null ou vazio é armazenado como null.',
            example: '(85) 99999-1234'
        },
        email: {
            type: 'string',
            nullable: true,
            maxLength: 254,
            description:
                'Opcional. Quando preenchido, deve ter formato como contato@empresa.com. Ausente, null ou vazio é armazenado como null.',
            example: 'contato@example.com'
        }
    }
};

const fornecedorResposta = {
    type: 'object',
    required: [
        'id',
        'nome',
        'cnpj',
        'telefone',
        'email',
        'criado_em',
        'atualizado_em'
    ],
    properties: {
        id: {
            type: 'integer',
            minimum: 1,
            maximum: 2147483647,
            readOnly: true,
            example: 1
        },
        ...fornecedorEntrada.properties,
        criado_em: {
            type: 'string',
            format: 'date-time',
            readOnly: true,
            description: 'Data de criação administrada pelo banco.',
            example: '2026-10-30T12:00:00.000Z'
        },
        atualizado_em: {
            type: 'string',
            format: 'date-time',
            readOnly: true,
            description: 'Data da última atualização administrada pelo banco.',
            example: '2026-10-30T13:00:00.000Z'
        }
    }
};

module.exports = {
    openapi: '3.0.3',

    info: {
        title: 'API do Mercadinho São José',
        version: '1.0.0',
        description: 'Cadastro de fornecedores e seus produtos.'
    },

    servers: [
        { url: '/' }
    ],

    components: {
        schemas: {
            FornecedorEntrada: fornecedorEntrada,
            Fornecedor: fornecedorResposta,
            ProdutoEntrada: produtoEntrada,
            Produto: produtoResposta
        }
    },

    paths: {
        '/fornecedores': {
            post: {
                tags: ['Fornecedores'],
                summary: 'Cadastrar fornecedor',

                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/FornecedorEntrada'
                            }
                        }
                    }
                },

                responses: {
                    '201': {
                        description: 'Fornecedor cadastrado com sucesso.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Fornecedor'
                                }
                            }
                        }
                    },
                    '400': {
                        description: 'Nome, CNPJ, telefone ou e-mail inválido.'
                    },
                    '500': {
                        description: 'Erro ao cadastrar fornecedor.'
                    }
                }
            },
            get: {
                tags: ['Fornecedores'],
                summary: 'Listar fornecedores',

                responses: {
                    '200': {
                        description: 'Lista de fornecedores. Pode estar vazia.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        $ref: '#/components/schemas/Fornecedor'
                                    }
                                }
                            }
                        }
                    },

                    '500': {
                        description: 'Erro ao consultar fornecedores.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        mensagem: { type: 'string' }
                                    }
                                },
                                example: {
                                    mensagem: 'Erro interno do servidor. Tente novamente.'
                                }
                            }
                        }
                    }
                }
            }
        },
        '/fornecedores/{id}': {
            delete: {
                tags: ['Fornecedores'],
                summary: 'Excluir fornecedor',
                description: 'Permite excluir somente fornecedores sem produtos.',

                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 2147483647
                        },
                        example: 1
                    }
                ],

                responses: {
                    '204': {
                        description: 'Fornecedor excluído. Resposta sem conteúdo.'
                    },
                    '400': {
                        description: 'ID inválido.'
                    },
                    '404': {
                        description: 'Fornecedor não encontrado.'
                    },
                    '409': {
                        description: 'Fornecedor possui produtos vinculados.'
                    },
                    '500': {
                        description: 'Erro ao excluir fornecedor.'
                    }
                }
            },
            put: {
                tags: ['Fornecedores'],
                summary: 'Atualizar fornecedor',
                description: 'Substitui os dados editáveis do fornecedor. Nome e CNPJ são obrigatórios. Omitir telefone ou e-mail, enviar null ou texto vazio limpa o valor anterior. As datas são administradas pelo banco.',
                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 2147483647
                        },
                        example: 1
                    }
                ],

                requestBody: {
                    $ref: '#/paths/~1fornecedores/post/requestBody'
                },

                responses: {
                    '200': {
                        description: 'Fornecedor atualizado com sucesso.',
                        content: {
                            'application/json': {
                                'application/json': {
                                    schema: {
                                        $ref: '#/components/schemas/Fornecedor'
                                    }
                                }
                            }
                        }
                    },
                    '400': {
                        description: 'ID, nome, CNPJ, telefone ou e-mail inválido.'
                    },
                    '404': {
                        description: 'Fornecedor não encontrado.'
                    },
                    '500': {
                        description: 'Erro ao atualizar fornecedor.'
                    }
                }
            },
            get: {
                tags: ['Fornecedores'],
                summary: 'Consultar fornecedor por ID',

                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        description: 'Identificador do fornecedor.',
                        schema: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 2147483647
                        },
                        example: 1
                    }
                ],

                responses: {
                    '200': {
                        description: 'Fornecedor encontrado.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Fornecedor'
                                }
                            }
                        }
                    },
                    '400': {
                        description: 'ID inválido.'
                    },
                    '404': {
                        description: 'Fornecedor não encontrado.'
                    },
                    '500': {
                        description: 'Erro ao consultar fornecedor.'
                    }
                }
            }
        },
        '/fornecedores/{id}/produtos': {
            get: {
                tags: ['Produtos'],
                summary: 'Listar produtos de um fornecedor',

                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        description: 'Identificador do fornecedor.',
                        schema: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 2147483647
                        },
                        example: 1
                    }
                ],

                responses: {
                    '200': {
                        description: 'Lista de produtos. Pode estar vazia.',
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'array',
                                    items: {
                                        $ref: '#/components/schemas/Produto'
                                    }
                                }
                            }
                        }
                    },
                    '400': {
                        description: 'ID inválido.'
                    },
                    '404': {
                        description: 'Fornecedor não encontrado.'
                    },
                    '500': {
                        description: 'Erro ao listar os produtos.'
                    }
                }
            }
        },
        '/produtos': {
            post: {
                tags: ['Produtos'],
                summary: 'Cadastrar produto',

                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                $ref: '#/components/schemas/ProdutoEntrada'
                            }
                        }
                    }
                },

                responses: {
                    '201': {
                        description: 'Produto cadastrado com sucesso.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Produto'
                                }
                            }
                        }
                    },
                    '400': {
                        description: 'Dados do produto inválidos.'
                    },
                    '404': {
                        description: 'Fornecedor não encontrado.'
                    },
                    '409': {
                        description: 'Conflito no vínculo entre fornecedor e produto.'
                    },
                    '500': {
                        description: 'Erro ao cadastrar produto.'
                    }
                }
            }
        },
        '/produtos/{id}': {
            parameters: [
                {
                    name: 'id',
                    in: 'path',
                    required: true,
                    description: 'Identificador do produto.',
                    schema: {
                        type: 'integer',
                        minimum: 1,
                        maximum: 2147483647
                    },
                    example: 1
                }
            ],

            get: {
                tags: ['Produtos'],
                summary: 'Consultar produto por ID',

                responses: {
                    '200': {
                        description: 'Produto retornado com sucesso.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Produto'
                                }
                            }
                        }
                    },
                    '400': { description: 'ID inválido.' },
                    '404': { description: 'Produto não encontrado.' },
                    '500': { description: 'Erro ao consultar produto.' }
                }
            },

            put: {
                tags: ['Produtos'],
                summary: 'Atualizar produto',
                description: 'Substitui os dados editáveis do produto. Nome, quantidade em estoque e fornecedor são obrigatórios. Omitir descricao, enviar null ou texto vazio limpa a descrição anterior. As datas são administradas pelo banco.',

                requestBody: {
                    $ref: '#/paths/~1produtos/post/requestBody'
                },

                responses: {
                    '200': {
                        description: 'Fornecedor atualizado com sucesso.',
                        content: {
                            'application/json': {
                                schema: {
                                    $ref: '#/components/schemas/Fornecedor'
                                }
                            }
                        }
                    },
                    '400': { description: 'ID ou dados do produto inválidos.' },
                    '404': { description: 'Produto ou fornecedor não encontrado.' },
                    '409': { description: 'Conflito no vínculo entre fornecedor e produto.' },
                    '500': { description: 'Erro ao atualizar produto.' }
                }
            },

            delete: {
                tags: ['Produtos'],
                summary: 'Excluir produto',

                responses: {
                    '204': {
                        description: 'Produto excluído. Resposta sem conteúdo.'
                    },
                    '400': { description: 'ID inválido.' },
                    '404': { description: 'Produto não encontrado.' },
                    '500': { description: 'Erro ao excluir produto.' }
                }
            }
        }
    }
};