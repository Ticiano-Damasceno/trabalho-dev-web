const pool = require('../database/postgres');

async function listar() {
  const resultado = await pool.query(`
    SELECT id, nome, cnpj
    FROM fornecedores
    ORDER BY nome, id
  `);

  return resultado.rows;
}

async function criar({ nome, cnpj }) {
  const resultado = await pool.query(`
    INSERT INTO fornecedores (nome, cnpj)
    VALUES ($1, $2)
    RETURNING id, nome, cnpj
  `, [nome, cnpj]);

  return resultado.rows[0];
}

async function buscarPorId(id) {
  const resultado = await pool.query(`
    SELECT id, nome, cnpj
    FROM fornecedores
    WHERE id = $1
  `, [id]);

  return resultado.rows[0];
}

async function atualizar(id, { nome, cnpj }) {
  const resultado = await pool.query(`
    UPDATE fornecedores
    SET nome = $1, cnpj = $2
    WHERE id = $3
    RETURNING id, nome, cnpj
  `, [nome, cnpj, id]);

  return resultado.rows[0];
}

async function excluir(id) {
  const resultado = await pool.query(`
    DELETE FROM fornecedores
    WHERE id = $1
      AND NOT EXISTS (
        SELECT 1
        FROM produtos
        WHERE fornecedor_id = fornecedores.id
      )
  `, [id]);

  return resultado.rowCount > 0;
}

module.exports = { listar, criar, buscarPorId, atualizar, excluir };