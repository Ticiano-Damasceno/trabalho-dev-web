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
                                        example: '12345678000190'
                                    }
                                }
                            }
                        }
                    }
                },

                responses: {
                    '201': {
                        description: 'Fornecedor cadastrado com sucesso.',
                        content: {
                            'application/json': {
                                example: {
                                    id: 1,
                                    nome: 'Distribuidora Exemplo',
                                    cnpj: '12345678000190'
                                }
                            }
                        }
                    },
                    '400': {
                        description: 'Nome ou CNPJ inválido.'
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
                                        type: 'object',
                                        required: ['id', 'nome', 'cnpj'],
                                        properties: {
                                            id: {
                                                type: 'integer',
                                                example: 1
                                            },
                                            nome: {
                                                type: 'string',
                                                example: 'Distribuidora Exemplo'
                                            },
                                            cnpj: {
                                                type: 'string',
                                                pattern: '^[0-9]{14}$',
                                                example: '12345678000190'
                                            }
                                        }
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
                                    mensagem: 'Não foi possível listar os fornecedores.'
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
                            maximum: 9007199254740991
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

                parameters: [
                    {
                        name: 'id',
                        in: 'path',
                        required: true,
                        schema: {
                            type: 'integer',
                            minimum: 1,
                            maximum: 9007199254740991
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
                                example: {
                                    id: 1,
                                    nome: 'Distribuidora Exemplo Atualizada',
                                    cnpj: '12345678000190'
                                }
                            }
                        }
                    },
                    '400': {
                        description: 'ID, nome ou CNPJ inválido.'
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
                            maximum: 9007199254740991
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
                                    type: 'object',
                                    required: ['id', 'nome', 'cnpj'],
                                    properties: {
                                        id: { type: 'integer' },
                                        nome: { type: 'string' },
                                        cnpj: { type: 'string' }
                                    }
                                },
                                example: {
                                    id: 1,
                                    nome: 'Distribuidora Exemplo',
                                    cnpj: '12345678000190'
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
                            maximum: 9007199254740991
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
                                        type: 'object',
                                        required: [
                                            'id',
                                            'nome',
                                            'quantidade_estoque',
                                            'fornecedor_id'
                                        ],
                                        properties: {
                                            id: {
                                                type: 'integer',
                                                example: 1
                                            },
                                            nome: {
                                                type: 'string',
                                                example: 'Produto de teste'
                                            },
                                            quantidade_estoque: {
                                                type: 'integer',
                                                minimum: 0,
                                                example: 5
                                            },
                                            fornecedor_id: {
                                                type: 'integer',
                                                example: 1
                                            }
                                        }
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
                                type: 'object',
                                required: ['nome', 'quantidade_estoque', 'fornecedor_id'],
                                properties: {
                                    nome: {
                                        type: 'string',
                                        minLength: 1,
                                        pattern: '\\S',
                                        example: 'Arroz 1 kg'
                                    },
                                    quantidade_estoque: {
                                        type: 'integer',
                                        minimum: 0,
                                        maximum: 9007199254740991,
                                        example: 10
                                    },
                                    fornecedor_id: {
                                        type: 'integer',
                                        minimum: 1,
                                        maximum: 9007199254740991,
                                        example: 1
                                    }
                                }
                            }
                        }
                    }
                },

                responses: {
                    '201': {
                        description: 'Produto cadastrado com sucesso.',
                        content: {
                            'application/json': {
                                example: {
                                    id: 1,
                                    nome: 'Arroz 1 kg',
                                    quantidade_estoque: 10,
                                    fornecedor_id: 1
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
                        maximum: 9007199254740991
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
                                    type: 'object',
                                    required: [
                                        'id',
                                        'nome',
                                        'quantidade_estoque',
                                        'fornecedor_id'
                                    ],
                                    properties: {
                                        id: { type: 'integer', example: 1 },
                                        nome: { type: 'string', example: 'Arroz 1 kg' },
                                        quantidade_estoque: {
                                            type: 'integer',
                                            minimum: 0,
                                            example: 10
                                        },
                                        fornecedor_id: { type: 'integer', example: 1 }
                                    }
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
                description: 'Exige nome, quantidade em estoque e fornecedor.',

                requestBody: {
                    $ref: '#/paths/~1produtos/post/requestBody'
                },

                responses: {
                    '200': {
                        $ref: '#/paths/~1produtos~1{id}/get/responses/200'
                    },
                    '400': { description: 'ID ou dados do produto inválidos.' },
                    '404': { description: 'Produto ou fornecedor não encontrado.' },
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