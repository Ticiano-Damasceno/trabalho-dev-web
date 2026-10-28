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

  if (typeof nome !== 'string' || nome.trim() === '') {
    return res.status(400).json({
      mensagem: 'O nome do fornecedor é obrigatório.'
    });
  }

  if (
    typeof cnpj !== 'string' ||
    cnpj.length !== 14 ||
    /\D/.test(cnpj)
  ) {
    return res.status(400).json({
      mensagem: 'O CNPJ deve conter exatamente 14 dígitos, sem pontuação.'
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

module.exports = { listar, criar };