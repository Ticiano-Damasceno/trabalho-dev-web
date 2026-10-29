const fornecedorRepository = require('../repositories/fornecedorRepository');

async function listar(req, res, next) {
  try {
    const fornecedores =  await fornecedorRepository.listar();

    return res.json(fornecedores);
  } catch (error) {
    return next(error);
  }
}

async function criar(req, res, next) {
  const { nome, cnpj } = req.body || {};
  const erroValidacao = validarFornecedor(nome, cnpj);

  if (erroValidacao) {
    return res.status(400).json({
      mensagem: erroValidacao
    });
  }

  try {
    const fornecedor = await fornecedorRepository.criar({
      nome: nome.trim(),
      cnpj
    });

    return res.status(201).json(fornecedor);
  } catch (error) {
    return next(error);
  }
}

async function buscarPorId(req, res, next) {
  const id = req.idValidado;
  try {
    const fornecedor = await fornecedorRepository.buscarPorId(id);

    if (!fornecedor) {
      return res.status(404).json({
        mensagem: 'Fornecedor não encontrado.'
      });
    }

    return res.json(fornecedor);
  } catch (error) {
    return next(error);
  }
}

function validarFornecedor(nome, cnpj) {
  if (typeof nome !== 'string' || nome.trim() === '') {
    return 'O nome do fornecedor é obrigatório.';
  }

  if (
    typeof cnpj !== 'string' ||
    cnpj.length !== 14 ||
    /\D/.test(cnpj)
  ) {
    return 'O CNPJ deve conter exatamente 14 dígitos, sem pontuação.';
  }

  return null;
}

async function atualizar(req, res, next) {
  const id = req.idValidado;
  const { nome, cnpj } = req.body || {};
  const erroValidacao = validarFornecedor(nome, cnpj);

  if (erroValidacao) {
    return res.status(400).json({
      mensagem: erroValidacao
    });
  }

  try {
    const fornecedor = await fornecedorRepository.atualizar(id, {
      nome: nome.trim(),
      cnpj
    });

    if (!fornecedor) {
      return res.status(404).json({
        mensagem: 'Fornecedor não encontrado.'
      });
    }

    return res.json(fornecedor);
  } catch (error) {
    return next(error);
  }
}

async function excluir(req, res, next) {
  const id = req.idValidado;
  try {
    const excluido = fornecedorRepository.excluir(id);

    if (excluido) {
      return res.status(204).send();
    }

    const fornecedor = await fornecedorRepository.buscarPorId(id);

    if (!fornecedor) {
      return res.status(404).json({
        mensagem: 'Fornecedor não encontrado.'
      });
    }

    return res.status(409).json({
      mensagem: 'Não é possível excluir um fornecedor que possui produtos.'
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listar, criar, buscarPorId, atualizar, excluir };