const pool = require('../database/postgres');

async function listarPorFornecedor(fornecedorId) {
  const resultado = await pool.query(`
    SELECT id, nome, quantidade_estoque, fornecedor_id
    FROM produtos
    WHERE fornecedor_id = $1
    ORDER BY nome, id
  `, [fornecedorId]);

  return resultado.rows;
}

async function criar({ nome, quantidade_estoque, fornecedor_id }) {
  const resultado = await pool.query(`
    INSERT INTO produtos (nome, quantidade_estoque, fornecedor_id)
    VALUES ($1, $2, $3)
    RETURNING id, nome, quantidade_estoque, fornecedor_id
  `, [nome, quantidade_estoque, fornecedor_id]);

  return resultado.rows[0];
}

async function buscarPorId(id) {
  const resultado = await pool.query(`
    SELECT id, nome, quantidade_estoque, fornecedor_id
    FROM produtos
    WHERE id = $1
  `, [id]);

  return resultado.rows[0];
}

async function atualizar(id, { nome, quantidade_estoque, fornecedor_id }) {
  const resultado = await pool.query(`
    UPDATE produtos
    SET nome = $1, quantidade_estoque = $2, fornecedor_id = $3
    WHERE id = $4
    RETURNING id, nome, quantidade_estoque, fornecedor_id
  `, [nome, quantidade_estoque, fornecedor_id, id]);

  return resultado.rows[0];
}

async function excluir(id) {
  const resultado = await pool.query(`
    DELETE FROM produtos
    WHERE id = $1
  `, [id]);

  return resultado.rowCount > 0;
}

module.exports = {listarPorFornecedor,criar,buscarPorId,atualizar,excluir};