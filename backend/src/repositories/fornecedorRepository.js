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

function buscarPorId(id) {
  return db.prepare(`
    SELECT id, nome, cnpj
    FROM fornecedores
    WHERE id = ?
  `).get(id);
}

function atualizar(id, { nome, cnpj }) {
  return db.prepare(`
    UPDATE fornecedores
    SET nome = ?, cnpj = ?
    WHERE id = ?
    RETURNING id, nome, cnpj
  `).get(nome, cnpj, id);
}

function excluir(id) {
  const resultado = db.prepare(`
    DELETE FROM fornecedores
    WHERE id = ?
      AND NOT EXISTS (
        SELECT 1
        FROM produtos
        WHERE fornecedor_id = fornecedores.id
      )
  `).run(id);

  return resultado.changes > 0;
}

module.exports = { listar, criar, buscarPorId, atualizar, excluir };