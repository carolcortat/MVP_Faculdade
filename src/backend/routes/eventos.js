const express = require('express');
const router = express.Router();
const db = require('../database');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'circuito-tere-verde-secret';

// Middleware de autenticação
function autenticar(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ erro: 'Token não fornecido' });

  const token = auth.split(' ')[1];
  try {
    req.admin = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ erro: 'Token inválido' });
  }
}

// GET /api/eventos — público
router.get('/', (req, res) => {
  const eventos = db.prepare('SELECT * FROM eventos ORDER BY data ASC').all();
  res.json(eventos);
});

// POST /api/eventos — só admin
router.post('/', autenticar, (req, res) => {
  const { nome, descricao, data, horario, local, imagem_url } = req.body;
  if (!nome || !data) return res.status(400).json({ erro: 'Nome e data são obrigatórios' });

  const resultado = db.prepare(
    'INSERT INTO eventos (nome, descricao, data, horario, local, imagem_url) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(nome, descricao, data, horario, local, imagem_url);

  res.status(201).json({ id: resultado.lastInsertRowid, nome, descricao, data, horario, local, imagem_url });
});

// PUT /api/eventos/:id — só admin
router.put('/:id', autenticar, (req, res) => {
  const { nome, descricao, data, horario, local, imagem_url } = req.body;
  const { id } = req.params;

  const evento = db.prepare('SELECT id FROM eventos WHERE id = ?').get(id);
  if (!evento) return res.status(404).json({ erro: 'Evento não encontrado' });

  db.prepare(
    'UPDATE eventos SET nome = ?, descricao = ?, data = ?, horario = ?, local = ?, imagem_url = ? WHERE id = ?'
  ).run(nome, descricao, data, horario, local, imagem_url, id);

  res.json({ mensagem: 'Evento atualizado com sucesso' });
});

// DELETE /api/eventos/:id — só admin
router.delete('/:id', autenticar, (req, res) => {
  const { id } = req.params;

  const evento = db.prepare('SELECT id FROM eventos WHERE id = ?').get(id);
  if (!evento) return res.status(404).json({ erro: 'Evento não encontrado' });

  db.prepare('DELETE FROM eventos WHERE id = ?').run(id);
  res.json({ mensagem: 'Evento deletado com sucesso' });
});

module.exports = router;