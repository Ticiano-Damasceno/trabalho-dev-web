const { DatabaseSync } = require('node:sqlite');
const { mkdirSync } = require('node:fs');
const path = require('node:path');

const dataDirectory = path.join(__dirname, '../../data');

mkdirSync(dataDirectory, { recursive: true });

const databasePath = path.join(dataDirectory, 'mercadinho.sqlite');

const db = new DatabaseSync(databasePath);

db.exec('PRAGMA foreign_keys = ON');

module.exports = db;