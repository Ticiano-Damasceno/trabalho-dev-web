const pool = require('../database/postgres');

const camposFornecedor = `
  id, nome, cnpj, telefone, email, criado_em, atualizado_em
`;

async function listar() {
  const resultado = await pool.query(`
    SELECT ${camposFornecedor}
    FROM fornecedores
    ORDER BY nome, id
  `);

  return resultado.rows;
}

async function criar({ nome, cnpj, telefone = null, email = null }) {
  const resultado = await pool.query(`
    INSERT INTO fornecedores (nome, cnpj, telefone, email)
    VALUES ($1, $2, $3, $4)
    RETURNING ${camposFornecedor}
  `, [nome, cnpj, telefone, email]);

  return resultado.rows[0];
}

async function buscarPorId(id) {
  const resultado = await pool.query(`
    SELECT ${camposFornecedor}
    FROM fornecedores
    WHERE id = $1
  `, [id]);

  return resultado.rows[0];
}

async function atualizar(
  id,
  { nome, cnpj, telefone = null, email = null }
) {
  const resultado = await pool.query(`
    UPDATE fornecedores
    SET
      nome = $1,
      cnpj = $2,
      telefone = $3,
      email = $4
    WHERE id = $5
    RETURNING ${camposFornecedor}
  `, [nome, cnpj, telefone, email, id]);

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

module.exports = { listar,  criar,  buscarPorId,  atualizar,  excluir };