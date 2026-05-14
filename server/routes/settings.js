const express = require('express');
const db = require('../db/database');
const router = express.Router();

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM settings').all();
  const settings = {};
  rows.forEach(r => { settings[r.key] = r.value; });
  res.json(settings);
});

router.put('/', (req, res) => {
  const upsert = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value');
  const updateMany = db.transaction((data) => {
    for (const [key, value] of Object.entries(data)) {
      upsert.run(key, String(value));
    }
  });
  updateMany(req.body);
  res.json({ message: 'Configurações salvas' });
});

module.exports = router;
