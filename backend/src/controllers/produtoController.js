const produtoRepository = require('../repositories/produtoRepository');
const fornecedorRepository = require('../repositories/fornecedorRepository');

async function listarPorFornecedor(req, res, next) {
    const fornecedorId = req.idValidado;
    try {
        const fornecedor = await fornecedorRepository.buscarPorId(fornecedorId);

        if (!fornecedor) {
            return res.status(404).json({
                mensagem: 'Fornecedor não encontrado.'
            });
        }

        const produtos = await produtoRepository.listarPorFornecedor(fornecedorId);

        return res.json(produtos);
    } catch (error) {
        return next(error);
    }
}

function validarProduto(nome, quantidadeEstoque, fornecedorId, descricao) {
    if (typeof nome !== 'string' || nome.trim() === '') {
        return 'O nome do produto é obrigatório.';
    }

    if (
        !Number.isSafeInteger(quantidadeEstoque) ||
        quantidadeEstoque < 0 ||
        quantidadeEstoque > 2147483647
    ) {
        return 'O estoque deve ser um número inteiro entre 0 e 2147483647.';
    }

    if (
        !Number.isSafeInteger(fornecedorId) ||
        fornecedorId <= 0 ||
        fornecedorId > 2147483647
    ) {
        return 'O ID do fornecedor deve ser um número inteiro entre 1 e 2147483647.';
    }

    if (
        descricao !== undefined &&
        descricao !== null &&
        typeof descricao !== 'string'
    ) {
        return 'A descrição deve ser informada como texto.';
    }

    return null;
}

async function criar(req, res, next) {
    const { nome, descricao, quantidade_estoque, fornecedor_id } = req.body || {};
    const erroValidacao = validarProduto(nome, quantidade_estoque, fornecedor_id, descricao);

    if (erroValidacao) {
        return res.status(400).json({
            mensagem: erroValidacao
        });
    }

    try {
        const fornecedor = await fornecedorRepository.buscarPorId(fornecedor_id);

        if (!fornecedor) {
            return res.status(404).json({
                mensagem: 'Fornecedor não encontrado.'
            });
        }

        const produto = await produtoRepository.criar({
            nome: nome.trim(),
            descricao: descricao?.trim() || null,
            quantidade_estoque,
            fornecedor_id
        });

        return res.status(201).json(produto);
    } catch (error) {
        return next(error);
    }
}

async function buscarPorId(req, res, next) {
    const id = req.idValidado;
    try {
        const produto = await produtoRepository.buscarPorId(id);

        if (!produto) {
            return res.status(404).json({
                mensagem: 'Produto não encontrado.'
            });
        }

        return res.json(produto);
    } catch (error) {
        return next(error);
    }
}

async function atualizar(req, res, next) {
    const id = req.idValidado;
    const { nome, descricao, quantidade_estoque, fornecedor_id } = req.body || {};
    const erroValidacao = validarProduto(nome, quantidade_estoque, fornecedor_id, descricao);


    if (erroValidacao) {
        return res.status(400).json({
            mensagem: erroValidacao
        });
    }

    try {
        const produtoExistente = await produtoRepository.buscarPorId(id);

        if (!produtoExistente) {
            return res.status(404).json({
                mensagem: 'Produto não encontrado.'
            });
        }

        const fornecedor = await fornecedorRepository.buscarPorId(fornecedor_id);

        if (!fornecedor) {
            return res.status(404).json({
                mensagem: 'Fornecedor não encontrado.'
            });
        }

        const produto = await produtoRepository.atualizar(id, {
            nome: nome.trim(),
            descricao: descricao?.trim() || null,
            quantidade_estoque,
            fornecedor_id
        });

        if (!produto) {
            return res.status(404).json({
                mensagem: 'Produto não encontrado.'
            });
        }

        return res.json(produto);
    } catch (error) {
        return next(error);
    }
}

async function excluir(req, res, next) {
    const id = req.idValidado;
    try {
        const excluido = await produtoRepository.excluir(id);

        if (!excluido) {
            return res.status(404).json({
                mensagem: 'Produto não encontrado.'
            });
        }

        return res.status(204).send();
    } catch (error) {
        return next(error);
    }
}

module.exports = { listarPorFornecedor, criar, buscarPorId, atualizar, excluir };