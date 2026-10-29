const produtoRepository = require('../repositories/produtoRepository');
const fornecedorRepository = require('../repositories/fornecedorRepository');

function listarPorFornecedor(req, res, next) {
    const fornecedorId = req.idValidado;
    try {
        const fornecedor = fornecedorRepository.buscarPorId(fornecedorId);

        if (!fornecedor) {
            return res.status(404).json({
                mensagem: 'Fornecedor não encontrado.'
            });
        }

        const produtos = produtoRepository.listarPorFornecedor(fornecedorId);

        return res.json(produtos);
    } catch (error) {
        return next(error);
    }
}

function validarProduto(nome, quantidadeEstoque, fornecedorId) {
    if (typeof nome !== 'string' || nome.trim() === '') {
        return 'O nome do produto é obrigatório.';
    }

    if (
        !Number.isSafeInteger(quantidadeEstoque) ||
        quantidadeEstoque < 0
    ) {
        return 'A quantidade em estoque deve ser um número inteiro não negativo.';
    }

    if (!Number.isSafeInteger(fornecedorId) || fornecedorId <= 0) {
        return 'O fornecedor deve ser identificado por um número inteiro positivo.';
    }

    return null;
}

function criar(req, res, next) {
    const { nome, quantidade_estoque, fornecedor_id } = req.body || {};

    const erroValidacao = validarProduto(
        nome,
        quantidade_estoque,
        fornecedor_id
    );

    if (erroValidacao) {
        return res.status(400).json({
            mensagem: erroValidacao
        });
    }

    try {
        const fornecedor = fornecedorRepository.buscarPorId(fornecedor_id);

        if (!fornecedor) {
            return res.status(404).json({
                mensagem: 'Fornecedor não encontrado.'
            });
        }

        const produto = produtoRepository.criar({
            nome: nome.trim(),
            quantidade_estoque,
            fornecedor_id
        });

        return res.status(201).json(produto);
    } catch (error) {
        return next(error);
    }
}

function obterIdProduto(valor) {
    const id = Number(valor);

    if (!/^[1-9][0-9]*$/.test(valor) || !Number.isSafeInteger(id)) {
        return null;
    }

    return id;
}

function buscarPorId(req, res, next) {
    const id = req.idValidado;
    try {
        const produto = produtoRepository.buscarPorId(id);

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

function atualizar(req, res, next) {
    const id = req.idValidado;
    const { nome, quantidade_estoque, fornecedor_id } = req.body || {};

    const erroValidacao = validarProduto(
        nome,
        quantidade_estoque,
        fornecedor_id
    );

    if (erroValidacao) {
        return res.status(400).json({
            mensagem: erroValidacao
        });
    }

    try {
        const produtoExistente = produtoRepository.buscarPorId(id);

        if (!produtoExistente) {
            return res.status(404).json({
                mensagem: 'Produto não encontrado.'
            });
        }

        const fornecedor = fornecedorRepository.buscarPorId(fornecedor_id);

        if (!fornecedor) {
            return res.status(404).json({
                mensagem: 'Fornecedor não encontrado.'
            });
        }

        const produto = produtoRepository.atualizar(id, {
            nome: nome.trim(),
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

function excluir(req, res, next) {
    const id = req.idValidado;
    try {
        const excluido = produtoRepository.excluir(id);

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