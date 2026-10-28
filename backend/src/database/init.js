const { readFileSync } = require('node:fs');
const path = require('node:path');
const db = require('./connection');

try {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf8');

  db.exec('BEGIN');
  db.exec(schema);
  db.exec('COMMIT');

  console.log('Banco preparado com sucesso!');

  const tabelas = db.prepare(`
    SELECT name
    FROM sqlite_schema
    WHERE type = 'table'
      AND name NOT LIKE 'sqlite_%'
    ORDER BY name
  `).all();

  console.table(tabelas);
} catch (error) {
  if (db.isTransaction) {
    db.exec('ROLLBACK');
  }

  console.error('Erro ao preparar o banco:', error.message);
  process.exitCode = 1;
} finally {
  db.close();
}