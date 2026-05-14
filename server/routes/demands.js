const express = require('express');
const db = require('../db/database');
const router = express.Router();

const STATUS_FLOW = [
  'rascunho',
  'aguardando_aprovacao_flip',
  'aprovado_flip',
  'aguardando_aprovacao_cliente',
  'aprovado_cliente',
  'agendado',
  'publicado'
];

router.get('/', (req, res) => {
  const { status, client_id, limit } = req.query;
  let query = `
    SELECT d.*, c.name as client_name, c.logo_path as client_logo
    FROM demands d
    LEFT JOIN clients c ON d.client_id = c.id
    WHERE 1=1
  `;
  const params = [];
  if (status) { query += ' AND d.status = ?'; params.push(status); }
  if (client_id) { query += ' AND d.client_id = ?'; params.push(client_id); }
  query += ' ORDER BY d.created_at DESC';
  if (limit) { query += ' LIMIT ?'; params.push(parseInt(limit)); }
  res.json(db.prepare(query).all(...params));
});

router.get('/pending-counts', (req, res) => {
  const flip = db.prepare("SELECT COUNT(*) as c FROM demands WHERE status = 'aguardando_aprovacao_flip'").get().c;
  const cliente = db.prepare("SELECT COUNT(*) as c FROM demands WHERE status = 'aguardando_aprovacao_cliente'").get().c;
  res.json({ flip, cliente, total: flip + cliente });
});

router.get('/:id', (req, res) => {
  const demand = db.prepare(`
    SELECT d.*, c.name as client_name, c.logo_path as client_logo, c.briefing as client_briefing
    FROM demands d LEFT JOIN clients c ON d.client_id = c.id
    WHERE d.id = ?
  `).get(req.params.id);
  if (!demand) return res.status(404).json({ error: 'Demanda não encontrada' });
  const history = db.prepare('SELECT * FROM demand_history WHERE demand_id = ? ORDER BY changed_at ASC').all(req.params.id);
  const schedule = db.prepare('SELECT * FROM schedules WHERE demand_id = ? ORDER BY id DESC LIMIT 1').get(req.params.id);
  res.json({ ...demand, history, schedule });
});

router.post('/', (req, res) => {
  const { client_id, is_avulso, client_name_avulso, briefing_avulso, type, objective, notes, caption, hashtags, cta, image_url } = req.body;
  if (!type || !objective) return res.status(400).json({ error: 'Tipo e objetivo são obrigatórios' });
  const result = db.prepare(`
    INSERT INTO demands (client_id, is_avulso, client_name_avulso, briefing_avulso, type, objective, notes, caption, hashtags, cta, image_url, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'rascunho')
  `).run(client_id || null, is_avulso ? 1 : 0, client_name_avulso || null, briefing_avulso || null,
    type, objective, notes || null, caption || null, hashtags || null, cta || null, image_url || null);
  const id = result.lastInsertRowid;
  db.prepare(`INSERT INTO demand_history (demand_id, from_status, to_status, changed_by) VALUES (?, null, 'rascunho', 'Sistema')`).run(id);
  res.status(201).json({ id, message: 'Demanda criada' });
});

router.put('/:id', (req, res) => {
  const { caption, hashtags, cta, image_url, notes } = req.body;
  const existing = db.prepare('SELECT * FROM demands WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Demanda não encontrada' });
  db.prepare(`
    UPDATE demands SET caption=?, hashtags=?, cta=?, image_url=?, notes=?, updated_at=datetime('now','localtime') WHERE id=?
  `).run(caption ?? existing.caption, hashtags ?? existing.hashtags, cta ?? existing.cta,
    image_url ?? existing.image_url, notes ?? existing.notes, req.params.id);
  res.json({ message: 'Demanda atualizada' });
});

router.post('/:id/submit', (req, res) => {
  const demand = db.prepare('SELECT * FROM demands WHERE id = ?').get(req.params.id);
  if (!demand) return res.status(404).json({ error: 'Demanda não encontrada' });
  if (demand.status !== 'rascunho') return res.status(400).json({ error: 'Somente rascunhos podem ser enviados para aprovação' });
  db.prepare("UPDATE demands SET status='aguardando_aprovacao_flip', updated_at=datetime('now','localtime') WHERE id=?").run(req.params.id);
  db.prepare("INSERT INTO demand_history (demand_id, from_status, to_status, changed_by) VALUES (?, 'rascunho', 'aguardando_aprovacao_flip', 'Sistema')").run(req.params.id);
  res.json({ message: 'Enviado para fila de aprovação FLIP' });
});

router.post('/:id/approve-flip', (req, res) => {
  const { changed_by, comment } = req.body;
  const demand = db.prepare('SELECT * FROM demands WHERE id = ?').get(req.params.id);
  if (!demand) return res.status(404).json({ error: 'Demanda não encontrada' });
  if (demand.status !== 'aguardando_aprovacao_flip') return res.status(400).json({ error: 'Status inválido para esta ação' });
  db.prepare("UPDATE demands SET status='aguardando_aprovacao_cliente', updated_at=datetime('now','localtime') WHERE id=?").run(req.params.id);
  db.prepare("INSERT INTO demand_history (demand_id, from_status, to_status, changed_by, comment) VALUES (?, 'aguardando_aprovacao_flip', 'aguardando_aprovacao_cliente', ?, ?)").run(req.params.id, changed_by || 'FLIP', comment || null);
  res.json({ message: 'Aprovado pelo FLIP. Aguardando aprovação do cliente.' });
});

router.post('/:id/approve-client', (req, res) => {
  const { changed_by, comment } = req.body;
  const demand = db.prepare('SELECT * FROM demands WHERE id = ?').get(req.params.id);
  if (!demand) return res.status(404).json({ error: 'Demanda não encontrada' });
  if (demand.status !== 'aguardando_aprovacao_cliente') return res.status(400).json({ error: 'Status inválido para esta ação' });
  db.prepare("UPDATE demands SET status='aprovado_cliente', updated_at=datetime('now','localtime') WHERE id=?").run(req.params.id);
  db.prepare("INSERT INTO demand_history (demand_id, from_status, to_status, changed_by, comment) VALUES (?, 'aguardando_aprovacao_cliente', 'aprovado_cliente', ?, ?)").run(req.params.id, changed_by || 'FLIP', comment || null);
  res.json({ message: 'Aprovado pelo cliente! Agendamento liberado.' });
});

router.post('/:id/reject', (req, res) => {
  const { changed_by, comment } = req.body;
  const demand = db.prepare('SELECT * FROM demands WHERE id = ?').get(req.params.id);
  if (!demand) return res.status(404).json({ error: 'Demanda não encontrada' });
  const prev = demand.status;
  db.prepare("UPDATE demands SET status='rascunho', updated_at=datetime('now','localtime') WHERE id=?").run(req.params.id);
  db.prepare("INSERT INTO demand_history (demand_id, from_status, to_status, changed_by, comment) VALUES (?, ?, 'rascunho', ?, ?)").run(req.params.id, prev, changed_by || 'FLIP', comment || 'Devolvido para ajuste');
  res.json({ message: 'Devolvido para ajuste' });
});

module.exports = router;
