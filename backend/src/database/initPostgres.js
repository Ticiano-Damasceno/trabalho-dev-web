const { readFileSync } = require('node:fs');
const path = require('node:path');
const pool = require('./postgres');

async function inicializarBanco() {
  const schemaPath = path.join(__dirname, 'schema.postgres.sql');
  const schema = readFileSync(schemaPath, 'utf8');
  const migracaoPath = path.join(
    __dirname,
    'migrations',
    '001_completar_campos.sql'
  );

  const migracao = readFileSync(migracaoPath, 'utf8');
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await client.query(schema);
    await client.query(migracao);

    const resultado = await client.query(`
      SELECT
        table_name,
        column_name,
        data_type,
        is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name IN ('fornecedores', 'produtos')
      ORDER BY table_name, ordinal_position
    `);

    await client.query('COMMIT');

    console.log('Tabelas preparadas no Neon!');
    console.table(resultado.rows);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

inicializarBanco()
  .catch((error) => {
    console.error(
      'Falha ao preparar o banco. Código:',
      error.code || error.name
    );

    process.exitCode = 1;
  })
  .finally(() => pool.end());