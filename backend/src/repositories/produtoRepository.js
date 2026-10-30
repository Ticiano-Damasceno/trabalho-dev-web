const pool = require('../database/postgres');

const camposProduto = `
  id, fornecedor_id, nome, descricao, quantidade_estoque,
  criado_em, atualizado_em
`;

async function listarPorFornecedor(fornecedorId) {
  const resultado = await pool.query(`
    SELECT ${camposProduto}
    FROM produtos
    WHERE fornecedor_id = $1
    ORDER BY nome, id
  `, [fornecedorId]);

  return resultado.rows;
}

async function criar({
  nome,
  descricao = null,
  quantidade_estoque,
  fornecedor_id
}) {
  const resultado = await pool.query(`
    INSERT INTO produtos (
      nome, descricao, quantidade_estoque, fornecedor_id
    )
    VALUES ($1, $2, $3, $4)
    RETURNING ${camposProduto}
  `, [nome, descricao, quantidade_estoque, fornecedor_id]);

  return resultado.rows[0];
}

async function buscarPorId(id) {
  const resultado = await pool.query(`
    SELECT ${camposProduto}
    FROM produtos
    WHERE id = $1
  `, [id]);

  return resultado.rows[0];
}

async function atualizar(id, {
  nome,
  descricao = null,
  quantidade_estoque,
  fornecedor_id
}) {
  const resultado = await pool.query(`
    UPDATE produtos
    SET
      nome = $1,
      descricao = $2,
      quantidade_estoque = $3,
      fornecedor_id = $4
    WHERE id = $5
    RETURNING ${camposProduto}
  `, [nome, descricao, quantidade_estoque, fornecedor_id, id]);

  return resultado.rows[0];
}

async function excluir(id) {
  const resultado = await pool.query(`
    DELETE FROM produtos
    WHERE id = $1
  `, [id]);

  return resultado.rowCount > 0;
}

module.exports = {
  listarPorFornecedor,
  criar,
  buscarPorId,
  atualizar,
  excluir
};