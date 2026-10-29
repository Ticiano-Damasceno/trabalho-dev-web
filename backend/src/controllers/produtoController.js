const produtoRepository = require('../repositories/produtoRepository');
const fornecedorRepository = require('../repositories/fornecedorRepository');

function listarPorFornecedor(req, res) {
  const idRecebido = req.params.id;
  const fornecedorId = Number(idRecebido);

  if (
    !/^[1-9][0-9]*$/.test(idRecebido) ||
    !Number.isSafeInteger(fornecedorId)
  ) {
    return res.status(400).json({
      mensagem: 'O ID deve ser um número inteiro positivo válido.'
    });
  }

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
    console.error('Erro ao listar produtos do fornecedor:', error);

    return res.status(500).json({
      mensagem: 'Não foi possível listar os produtos do fornecedor.'
    });
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

function criar(req, res) {
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
    console.error('Erro ao cadastrar produto:', error);

    return res.status(500).json({
      mensagem: 'Não foi possível cadastrar o produto.'
    });
  }
}

function obterIdProduto(valor) {
  const id = Number(valor);

  if (!/^[1-9][0-9]*$/.test(valor) || !Number.isSafeInteger(id)) {
    return null;
  }

  return id;
}

function buscarPorId(req, res) {
  const id = obterIdProduto(req.params.id);

  if (id === null) {
    return res.status(400).json({
      mensagem: 'O ID deve ser um número inteiro positivo válido.'
    });
  }

  try {
    const produto = produtoRepository.buscarPorId(id);

    if (!produto) {
      return res.status(404).json({
        mensagem: 'Produto não encontrado.'
      });
    }

    return res.json(produto);
  } catch (error) {
    console.error('Erro ao consultar produto:', error);

    return res.status(500).json({
      mensagem: 'Não foi possível consultar o produto.'
    });
  }
}

function atualizar(req, res) {
  const id = obterIdProduto(req.params.id);

  if (id === null) {
    return res.status(400).json({
      mensagem: 'O ID deve ser um número inteiro positivo válido.'
    });
  }

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
    console.error('Erro ao atualizar produto:', error);

    return res.status(500).json({
      mensagem: 'Não foi possível atualizar o produto.'
    });
  }
}

function excluir(req, res) {
  const id = obterIdProduto(req.params.id);

  if (id === null) {
    return res.status(400).json({
      mensagem: 'O ID deve ser um número inteiro positivo válido.'
    });
  }

  try {
    const excluido = produtoRepository.excluir(id);

    if (!excluido) {
      return res.status(404).json({
        mensagem: 'Produto não encontrado.'
      });
    }

    return res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir produto:', error);

    return res.status(500).json({
      mensagem: 'Não foi possível excluir o produto.'
    });
  }
}

module.exports = { listarPorFornecedor, criar, buscarPorId, atualizar, excluir };