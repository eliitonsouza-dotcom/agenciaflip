require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');

const db = require('./db/database');

const clientsRouter = require('./routes/clients');
const demandsRouter = require('./routes/demands');
const schedulesRouter = require('./routes/schedules');
const campaignsRouter = require('./routes/campaigns');
const settingsRouter = require('./routes/settings');
const aiRouter = require('./routes/ai');
const metaRouter = require('./routes/meta');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/clients', clientsRouter);
app.use('/api/demands', demandsRouter);
app.use('/api/schedules', schedulesRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/meta', metaRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0-beta', message: 'Agência FLIP online' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Erro interno do servidor' });
});

app.listen(PORT, () => {
  console.log(`\n🟠 AGÊNCIA FLIP 1.0 Beta`);
  console.log(`   Servidor rodando em http://localhost:${PORT}`);
  console.log(`   Tom & Jéssica, bora trabalhar!\n`);
});
