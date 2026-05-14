const express = require('express');
const db = require('../db/database');
const router = express.Router();

router.get('/', (req, res) => {
  const { client_id } = req.query;
  let query = `SELECT ca.*, c.name as client_name, d.type as demand_type, d.image_url FROM campaigns ca LEFT JOIN clients c ON ca.client_id = c.id LEFT JOIN demands d ON ca.demand_id = d.id WHERE 1=1`;
  const params = [];
  if (client_id) { query += ' AND ca.client_id = ?'; params.push(client_id); }
  query += ' ORDER BY ca.created_at DESC';
  res.json(db.prepare(query).all(...params));
});

router.post('/', (req, res) => {
  const { client_id, demand_id, name, objective, budget_daily, start_date, end_date } = req.body;
  if (!name || !client_id) return res.status(400).json({ error: 'Nome e cliente são obrigatórios' });
  const result = db.prepare(`
    INSERT INTO campaigns (client_id, demand_id, name, objective, budget_daily, start_date, end_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'ativo')
  `).run(client_id, demand_id || null, name, objective || null, budget_daily || null, start_date || null, end_date || null);
  res.status(201).json({ id: result.lastInsertRowid, message: 'Campanha criada' });
});

router.put('/:id', (req, res) => {
  const { name, objective, budget_daily, start_date, end_date, status, meta_campaign_id } = req.body;
  const existing = db.prepare('SELECT * FROM campaigns WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Campanha não encontrada' });
  db.prepare(`UPDATE campaigns SET name=?, objective=?, budget_daily=?, start_date=?, end_date=?, status=?, meta_campaign_id=? WHERE id=?`).run(
    name ?? existing.name, objective ?? existing.objective, budget_daily ?? existing.budget_daily,
    start_date ?? existing.start_date, end_date ?? existing.end_date, status ?? existing.status,
    meta_campaign_id ?? existing.meta_campaign_id, req.params.id
  );
  res.json({ message: 'Campanha atualizada' });
});

module.exports = router;
