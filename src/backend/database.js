const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'database.db'));

// Habilita foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Cria as tabelas
db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    senha TEXT NOT NULL,
    criado_em TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS parques (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT,
    localizacao TEXT,
    horario_funcionamento TEXT,
    criado_em TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS trilhas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parque_id INTEGER NOT NULL,
    nome TEXT NOT NULL,
    dificuldade TEXT CHECK(dificuldade IN ('fácil', 'moderada', 'difícil')),
    distancia_km REAL,
    descricao TEXT,
    criado_em TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (parque_id) REFERENCES parques(id) ON DELETE CASCADE
  );

 CREATE TABLE IF NOT EXISTS eventos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT,
    data TEXT NOT NULL,
    horario TEXT,
    local TEXT,
    imagem_url TEXT,
    criado_em TEXT DEFAULT (datetime('now'))
  );
`);

module.exports = db;