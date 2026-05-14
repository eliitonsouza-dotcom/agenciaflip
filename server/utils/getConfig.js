const db = require('../db/database');

function getConfig(key) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return (row && row.value) ? row.value : (process.env[key] || null);
}

module.exports = getConfig;
