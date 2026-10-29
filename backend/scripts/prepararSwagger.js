const { mkdirSync, copyFileSync } = require('node:fs');
const path = require('node:path');
const swaggerUiDist = require('swagger-ui-dist');

const origem = swaggerUiDist.getAbsoluteFSPath();
const destino = path.join(__dirname, '..', 'public', 'docs');

const arquivos = [
  'swagger-ui.css',
  'swagger-ui-bundle.js',
  'swagger-ui-standalone-preset.js',
  'favicon-16x16.png',
  'favicon-32x32.png'
];

mkdirSync(destino, { recursive: true });

for (const arquivo of arquivos) {
  copyFileSync(
    path.join(origem, arquivo),
    path.join(destino, arquivo)
  );
}

console.log('Arquivos do Swagger preparados em public/docs.');