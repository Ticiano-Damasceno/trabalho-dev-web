const fornecedorRepository = require('../repositories/fornecedorRepository');

async function listar(req, res, next) {
  try {
    const fornecedores = await fornecedorRepository.listar();

    return res.json(fornecedores);
  } catch (error) {
    return next(error);
  }
}

async function criar(req, res, next) {
  const { nome, cnpj, telefone, email } = req.body || {};
  const erroValidacao = validarFornecedor(nome, cnpj, telefone, email);

  if (erroValidacao) {
    return res.status(400).json({
      mensagem: erroValidacao
    });
  }

  try {
    const fornecedor = await fornecedorRepository.criar({
      nome: nome.trim(),
      cnpj,
      telefone: telefone?.trim() || null,
      email: email?.trim() || null
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

function validarFornecedor(nome, cnpj, telefone, email) {
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

  return validarTelefone(telefone) || validarEmail(email);
}

function validarTelefone(telefone) {
  if (telefone === undefined || telefone === null) {
    return null;
  }

  if (typeof telefone !== 'string') {
    return 'O telefone deve ser informado como texto.';
  }

  const valor = telefone.trim();

  if (valor === '') {
    return null;
  }

  if (valor.length > 30) {
    return 'O telefone deve ter no máximo 30 caracteres.';
  }

  const digitos = valor.replace(/\D/g, '');

  if (
    !/^\+?[0-9()\s.-]+$/.test(valor) ||
    digitos.length < 10 ||
    digitos.length > 15
  ) {
    return 'Informe um telefone com 10 a 15 dígitos, incluindo o DDD.';
  }

  return null;
}

function validarEmail(email) {
  if (email === undefined || email === null) {
    return null;
  }

  if (typeof email !== 'string') {
    return 'O e-mail deve ser informado como texto.';
  }

  const valor = email.trim();

  if (valor === '') {
    return null;
  }

  if (valor.length > 254) {
    return 'O e-mail deve ter no máximo 254 caracteres.';
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor)) {
    return 'Informe um e-mail em formato válido.';
  }

  return null;
}

async function atualizar(req, res, next) {
  const id = req.idValidado;
  const { nome, cnpj, telefone, email } = req.body || {};
  const erroValidacao = validarFornecedor(nome, cnpj, telefone, email);

  if (erroValidacao) {
    return res.status(400).json({
      mensagem: erroValidacao
    });
  }

  try {
    const fornecedor = await fornecedorRepository.atualizar(id, {
      nome: nome.trim(),
      cnpj,
      telefone: telefone?.trim() || null,
      email: email?.trim() || null
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
    const excluido = await fornecedorRepository.excluir(id);

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