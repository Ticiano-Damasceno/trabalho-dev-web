const db = require('../database/connection');

function listarPorFornecedor(fornecedorId) {
  return db.prepare(`
    SELECT id, nome, quantidade_estoque, fornecedor_id
    FROM produtos
    WHERE fornecedor_id = ?
    ORDER BY nome, id
  `).all(fornecedorId);
}

function criar({ nome, quantidade_estoque, fornecedor_id }) {
  return db.prepare(`
    INSERT INTO produtos (nome, quantidade_estoque, fornecedor_id)
    VALUES (?, ?, ?)
    RETURNING id, nome, quantidade_estoque, fornecedor_id
  `).get(nome, quantidade_estoque, fornecedor_id);
}

function buscarPorId(id) {
  return db.prepare(`
    SELECT id, nome, quantidade_estoque, fornecedor_id
    FROM produtos
    WHERE id = ?
  `).get(id);
}

function atualizar(id, { nome, quantidade_estoque, fornecedor_id }) {
  return db.prepare(`
    UPDATE produtos
    SET nome = ?, quantidade_estoque = ?, fornecedor_id = ?
    WHERE id = ?
    RETURNING id, nome, quantidade_estoque, fornecedor_id
  `).get(nome, quantidade_estoque, fornecedor_id, id);
}

function excluir(id) {
  const resultado = db.prepare(`
    DELETE FROM produtos
    WHERE id = ?
  `).run(id);

  return resultado.changes > 0;
}

module.exports = { listarPorFornecedor, criar, buscarPorId, atualizar, excluir };