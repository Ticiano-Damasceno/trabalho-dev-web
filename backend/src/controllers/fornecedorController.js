const fornecedorRepository = require('../repositories/fornecedorRepository');

function listar(req, res) {
  try {
    const fornecedores = fornecedorRepository.listar();

    return res.json(fornecedores);
  } catch (error) {
    console.error('Erro ao listar fornecedores:', error);

    return res.status(500).json({
      mensagem: 'Não foi possível listar os fornecedores.'
    });
  }
}

function criar(req, res) {
  const { nome, cnpj } = req.body || {};
  const erroValidacao = validarFornecedor(nome, cnpj);

  if (erroValidacao) {
    return res.status(400).json({
      mensagem: erroValidacao
    });
  }

  try {
    const fornecedor = fornecedorRepository.criar({
      nome: nome.trim(),
      cnpj
    });

    return res.status(201).json(fornecedor);
  } catch (error) {
    console.error('Erro ao cadastrar fornecedor:', error);

    return res.status(500).json({
      mensagem: 'Não foi possível cadastrar o fornecedor.'
    });
  }
}

function buscarPorId(req, res) {
  const idRecebido = req.params.id;
  const id = Number(idRecebido);

  if (!/^[1-9][0-9]*$/.test(idRecebido) || !Number.isSafeInteger(id)) {
    return res.status(400).json({
      mensagem: 'O ID deve ser um número inteiro positivo válido.'
    });
  }

  try {
    const fornecedor = fornecedorRepository.buscarPorId(id);

    if (!fornecedor) {
      return res.status(404).json({
        mensagem: 'Fornecedor não encontrado.'
      });
    }

    return res.json(fornecedor);
  } catch (error) {
    console.error('Erro ao consultar fornecedor:', error);

    return res.status(500).json({
      mensagem: 'Não foi possível consultar o fornecedor.'
    });
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

function atualizar(req, res) {
  const idRecebido = req.params.id;
  const id = Number(idRecebido);

  if (!/^[1-9][0-9]*$/.test(idRecebido) || !Number.isSafeInteger(id)) {
    return res.status(400).json({
      mensagem: 'O ID deve ser um número inteiro positivo válido.'
    });
  }

  const { nome, cnpj } = req.body || {};
  const erroValidacao = validarFornecedor(nome, cnpj);

  if (erroValidacao) {
    return res.status(400).json({
      mensagem: erroValidacao
    });
  }

  try {
    const fornecedor = fornecedorRepository.atualizar(id, {
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
    console.error('Erro ao atualizar fornecedor:', error);

    return res.status(500).json({
      mensagem: 'Não foi possível atualizar o fornecedor.'
    });
  }
}

function excluir(req, res) {
  const idRecebido = req.params.id;
  const id = Number(idRecebido);

  if (!/^[1-9][0-9]*$/.test(idRecebido) || !Number.isSafeInteger(id)) {
    return res.status(400).json({
      mensagem: 'O ID deve ser um número inteiro positivo válido.'
    });
  }

  try {
    const excluido = fornecedorRepository.excluir(id);

    if (excluido) {
      return res.status(204).send();
    }

    const fornecedor = fornecedorRepository.buscarPorId(id);

    if (!fornecedor) {
      return res.status(404).json({
        mensagem: 'Fornecedor não encontrado.'
      });
    }

    return res.status(409).json({
      mensagem: 'Não é possível excluir um fornecedor que possui produtos.'
    });
  } catch (error) {
    console.error('Erro ao excluir fornecedor:', error);

    return res.status(500).json({
      mensagem: 'Não foi possível excluir o fornecedor.'
    });
  }
}

module.exports = { listar, criar, buscarPorId, atualizar, excluir };