const express = require('express');
const db = require('../db/database');
const router = express.Router();

router.get('/', (req, res) => {
  const { month, year, client_id } = req.query;
  let query = `
    SELECT s.*, d.type, d.caption, d.image_url, d.client_id, d.client_name_avulso, d.is_avulso,
           c.name as client_name, c.logo_path as client_logo
    FROM schedules s
    JOIN demands d ON s.demand_id = d.id
    LEFT JOIN clients c ON d.client_id = c.id
    WHERE 1=1
  `;
  const params = [];
  if (month && year) {
    query += ` AND strftime('%Y', s.scheduled_at) = ? AND strftime('%m', s.scheduled_at) = ?`;
    params.push(String(year), String(month).padStart(2, '0'));
  }
  if (client_id) { query += ' AND d.client_id = ?'; params.push(client_id); }
  query += ' ORDER BY s.scheduled_at ASC';
  res.json(db.prepare(query).all(...params));
});

router.post('/', (req, res) => {
  const { demand_id, scheduled_at, network, post_type } = req.body;
  if (!demand_id || !scheduled_at || !network) return res.status(400).json({ error: 'demand_id, scheduled_at e network são obrigatórios' });
  const demand = db.prepare('SELECT * FROM demands WHERE id = ?').get(demand_id);
  if (!demand) return res.status(404).json({ error: 'Demanda não encontrada' });
  if (demand.status !== 'aprovado_cliente') return res.status(400).json({ error: 'A demanda precisa ter os dois selos aprovados para ser agendada' });
  const result = db.prepare(`
    INSERT INTO schedules (demand_id, scheduled_at, network, post_type) VALUES (?, ?, ?, ?)
  `).run(demand_id, scheduled_at, network, post_type || 'feed');
  db.prepare("UPDATE demands SET status='agendado', updated_at=datetime('now','localtime') WHERE id=?").run(demand_id);
  db.prepare("INSERT INTO demand_history (demand_id, from_status, to_status, changed_by, comment) VALUES (?, 'aprovado_cliente', 'agendado', 'Sistema', ?)").run(demand_id, `Agendado para ${scheduled_at} em ${network}`);
  res.status(201).json({ id: result.lastInsertRowid, message: 'Post agendado com sucesso!' });
});

router.delete('/:id', (req, res) => {
  const schedule = db.prepare('SELECT * FROM schedules WHERE id = ?').get(req.params.id);
  if (!schedule) return res.status(404).json({ error: 'Agendamento não encontrado' });
  db.prepare('DELETE FROM schedules WHERE id = ?').run(req.params.id);
  db.prepare("UPDATE demands SET status='aprovado_cliente', updated_at=datetime('now','localtime') WHERE id=?").run(schedule.demand_id);
  res.json({ message: 'Agendamento removido' });
});

module.exports = router;
