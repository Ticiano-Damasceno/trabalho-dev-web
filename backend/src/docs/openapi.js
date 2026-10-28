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
        }
    }
};