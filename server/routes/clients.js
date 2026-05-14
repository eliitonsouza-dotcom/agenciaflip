const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db/database');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/logos');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', (req, res) => {
  const { search, status } = req.query;
  let query = 'SELECT * FROM clients WHERE 1=1';
  const params = [];
  if (search) { query += ' AND name LIKE ?'; params.push(`%${search}%`); }
  if (status) { query += ' AND status = ?'; params.push(status); }
  query += ' ORDER BY name ASC';
  res.json(db.prepare(query).all(...params));
});

router.get('/:id', (req, res) => {
  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
  if (!client) return res.status(404).json({ error: 'Cliente não encontrado' });
  res.json(client);
});

router.post('/', upload.single('logo'), (req, res) => {
  const { name, segment, briefing, social_facebook, social_instagram, status } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome do cliente é obrigatório' });
  const logo_path = req.file ? `/uploads/logos/${req.file.filename}` : null;
  const result = db.prepare(`
    INSERT INTO clients (name, segment, logo_path, briefing, social_facebook, social_instagram, status)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(name, segment || '', logo_path, briefing || '', social_facebook ? 1 : 0, social_instagram ? 1 : 0, status || 'ativo');
  res.status(201).json({ id: result.lastInsertRowid, message: 'Cliente criado com sucesso' });
});

router.put('/:id', upload.single('logo'), (req, res) => {
  const { name, segment, briefing, social_facebook, social_instagram, status } = req.body;
  const existing = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Cliente não encontrado' });
  const logo_path = req.file ? `/uploads/logos/${req.file.filename}` : existing.logo_path;
  db.prepare(`
    UPDATE clients SET name=?, segment=?, logo_path=?, briefing=?, social_facebook=?, social_instagram=?, status=?
    WHERE id=?
  `).run(name || existing.name, segment ?? existing.segment, logo_path, briefing ?? existing.briefing,
    social_facebook !== undefined ? (social_facebook ? 1 : 0) : existing.social_facebook,
    social_instagram !== undefined ? (social_instagram ? 1 : 0) : existing.social_instagram,
    status || existing.status, req.params.id);
  res.json({ message: 'Cliente atualizado com sucesso' });
});

router.delete('/:id', (req, res) => {
  db.prepare('UPDATE clients SET status = ? WHERE id = ?').run('inativo', req.params.id);
  res.json({ message: 'Cliente desativado' });
});

module.exports = router;
