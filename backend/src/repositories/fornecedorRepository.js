const db = require('../database/connection');

function listar() {
  return db.prepare(`
    SELECT id, nome, cnpj
    FROM fornecedores
    ORDER BY nome, id
  `).all();
}

function criar({ nome, cnpj }) {
  return db.prepare(`
    INSERT INTO fornecedores (nome, cnpj)
    VALUES (?, ?)
    RETURNING id, nome, cnpj
  `).get(nome, cnpj);
}

module.exports = { listar, criar };