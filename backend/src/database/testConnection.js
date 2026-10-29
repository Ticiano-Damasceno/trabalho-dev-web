const pool = require('./postgres');

async function testarConexao() {
  try {
    const resultado = await pool.query('SELECT 1 AS conectado');

    console.log('Conexão com o Neon funcionando!');
    console.table(resultado.rows);
  } catch (error) {
    console.error(
      'Falha na conexão. Código:',
      error.code || 'não informado'
    );

    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

testarConexao();