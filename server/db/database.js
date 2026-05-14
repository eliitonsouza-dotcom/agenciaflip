const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../flip.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function init() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      segment TEXT,
      logo_path TEXT,
      briefing TEXT,
      social_facebook INTEGER DEFAULT 1,
      social_instagram INTEGER DEFAULT 1,
      status TEXT DEFAULT 'ativo',
      created_at TEXT DEFAULT (datetime('now','localtime'))
    );

    CREATE TABLE IF NOT EXISTS demands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER,
      client_name_avulso TEXT,
      briefing_avulso TEXT,
      is_avulso INTEGER DEFAULT 0,
      type TEXT NOT NULL,
      objective TEXT NOT NULL,
      notes TEXT,
      caption TEXT,
      hashtags TEXT,
      cta TEXT,
      image_path TEXT,
      image_url TEXT,
      status TEXT DEFAULT 'rascunho',
      created_at TEXT DEFAULT (datetime('now','localtime')),
      updated_at TEXT DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (client_id) REFERENCES clients(id)
    );

    CREATE TABLE IF NOT EXISTS demand_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      demand_id INTEGER NOT NULL,
      from_status TEXT,
      to_status TEXT NOT NULL,
      changed_by TEXT NOT NULL,
      comment TEXT,
      changed_at TEXT DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (demand_id) REFERENCES demands(id)
    );

    CREATE TABLE IF NOT EXISTS schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      demand_id INTEGER NOT NULL,
      scheduled_at TEXT NOT NULL,
      network TEXT NOT NULL,
      post_type TEXT DEFAULT 'feed',
      published_at TEXT,
      meta_post_id TEXT,
      FOREIGN KEY (demand_id) REFERENCES demands(id)
    );

    CREATE TABLE IF NOT EXISTS campaigns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER,
      demand_id INTEGER,
      name TEXT NOT NULL,
      objective TEXT,
      budget_daily REAL,
      start_date TEXT,
      end_date TEXT,
      meta_campaign_id TEXT,
      status TEXT DEFAULT 'ativo',
      created_at TEXT DEFAULT (datetime('now','localtime')),
      FOREIGN KEY (client_id) REFERENCES clients(id),
      FOREIGN KEY (demand_id) REFERENCES demands(id)
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  const clientCount = db.prepare('SELECT COUNT(*) as c FROM clients').get();
  if (clientCount.c === 0) {
    db.prepare(`
      INSERT INTO clients (name, segment, briefing, social_facebook, social_instagram, status)
      VALUES (?, ?, ?, 1, 1, 'ativo')
    `).run(
      'Restaurante Sabor & Arte',
      'Restaurante',
      'Tom de voz: descontraído, acolhedor e apetitoso.\nPúblico-alvo: famílias e casais de 25-50 anos na região central.\nProduto principal: almoço executivo e jantares especiais aos fins de semana.\nCores da marca: vermelho escuro (#8B0000) e dourado (#D4AF37).\nRestrições: não usar emojis em excesso. Sempre destacar o ambiente familiar.'
    );
    db.prepare(`
      INSERT INTO clients (name, segment, briefing, social_facebook, social_instagram, status)
      VALUES (?, ?, ?, 1, 1, 'ativo')
    `).run(
      'Clínica Vida Plena',
      'Saúde',
      'Tom de voz: profissional, empático e inspirador.\nPúblico-alvo: adultos de 30-60 anos buscando qualidade de vida.\nProduto principal: consultas de nutrição, psicologia e fisioterapia.\nCores da marca: verde (#2E7D32) e branco.\nRestrições: nunca prometer curas. Sempre ressaltar a importância do acompanhamento profissional.'
    );

    const clientId = db.prepare('SELECT id FROM clients WHERE name = ?').get('Restaurante Sabor & Arte').id;
    db.prepare(`
      INSERT INTO demands (client_id, type, objective, caption, hashtags, cta, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      clientId,
      'Post feed',
      'Divulgar o almoço executivo de segunda-feira com desconto de 10%',
      'Segunda-feira chegou com tudo! 🍽️ Nosso almoço executivo está esperando por você com 10% OFF hoje. Venha aproveitar sabor, qualidade e um ambiente aconchegante para começar a semana com o pé direito!',
      '#AlmoçoExecutivo #SaborEArte #PromoçãoDeSegunda #Restaurante #ComidaCaseira',
      'Reserve sua mesa pelo link na bio ou ligue agora!',
      'aprovado_cliente'
    );

    const demandId = db.prepare('SELECT id FROM demands ORDER BY id DESC LIMIT 1').get().id;
    db.prepare(`
      INSERT INTO demand_history (demand_id, from_status, to_status, changed_by, comment)
      VALUES (?, ?, ?, ?, ?)
    `).run(demandId, 'rascunho', 'aprovado_flip', 'Tom', 'Aprovado! Ficou excelente.');
    db.prepare(`
      INSERT INTO demand_history (demand_id, from_status, to_status, changed_by, comment)
      VALUES (?, ?, ?, ?, ?)
    `).run(demandId, 'aprovado_flip', 'aprovado_cliente', 'Jéssica', 'Cliente aprovou via WhatsApp.');
  }

  const settingsCount = db.prepare('SELECT COUNT(*) as c FROM settings').get();
  if (settingsCount.c === 0) {
    db.prepare("INSERT INTO settings (key, value) VALUES ('agency_name', 'Agência FLIP')").run();
    db.prepare("INSERT INTO settings (key, value) VALUES ('owner_1', 'Tom')").run();
    db.prepare("INSERT INTO settings (key, value) VALUES ('owner_2', 'Jéssica')").run();
  }
}

init();
module.exports = db;
