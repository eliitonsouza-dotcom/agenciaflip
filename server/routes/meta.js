const express = require('express');
const axios = require('axios');
const db = require('../db/database');
const getConfig = require('../utils/getConfig');
const router = express.Router();

const META_BASE = 'https://graph.facebook.com/v19.0';

router.post('/publish/:schedule_id', async (req, res) => {
  const schedule = db.prepare('SELECT * FROM schedules WHERE id = ?').get(req.params.schedule_id);
  if (!schedule) return res.status(404).json({ error: 'Agendamento não encontrado' });

  const demand = db.prepare('SELECT * FROM demands WHERE id = ?').get(schedule.demand_id);
  if (!demand) return res.status(404).json({ error: 'Demanda não encontrada' });

  const accessToken = getConfig('META_ACCESS_TOKEN');
  if (!accessToken) {
    return res.status(400).json({ error: 'META_ACCESS_TOKEN não configurado. Acesse Configurações.' });
  }

  const caption = `${demand.caption}\n\n${demand.cta || ''}\n\n${demand.hashtags || ''}`.trim();

  try {
    let post_id = null;

    if (schedule.network === 'facebook' || schedule.network === 'ambos') {
      const pageId = getConfig('META_PAGE_ID_FACEBOOK');
      if (pageId) {
        const fbRes = await axios.post(`${META_BASE}/${pageId}/photos`, {
          url: demand.image_url,
          message: caption,
          access_token: accessToken
        });
        post_id = fbRes.data.id;
      }
    }

    if (schedule.network === 'instagram' || schedule.network === 'ambos') {
      const igId = getConfig('META_PAGE_ID_INSTAGRAM');
      if (igId) {
        const containerRes = await axios.post(`${META_BASE}/${igId}/media`, {
          image_url: demand.image_url,
          caption,
          access_token: accessToken
        });
        const containerId = containerRes.data.id;
        const publishRes = await axios.post(`${META_BASE}/${igId}/media_publish`, {
          creation_id: containerId,
          access_token: accessToken
        });
        post_id = post_id || publishRes.data.id;
      }
    }

    const now = new Date().toISOString();
    db.prepare("UPDATE schedules SET published_at=?, meta_post_id=? WHERE id=?").run(now, post_id, schedule.id);
    db.prepare("UPDATE demands SET status='publicado', updated_at=datetime('now','localtime') WHERE id=?").run(schedule.demand_id);
    db.prepare("INSERT INTO demand_history (demand_id, from_status, to_status, changed_by, comment) VALUES (?, 'agendado', 'publicado', 'Sistema', ?)").run(schedule.demand_id, `Publicado no ${schedule.network}. ID: ${post_id}`);

    res.json({ message: 'Post publicado com sucesso!', post_id });

  } catch (err) {
    console.error('Erro Meta API:', err.response?.data || err.message);
    res.status(500).json({ error: 'Erro ao publicar. Verifique os tokens do Meta.', details: err.response?.data });
  }
});

router.get('/insights/:client_id', async (req, res) => {
  const accessToken = getConfig('META_ACCESS_TOKEN');
  const pageId = getConfig('META_PAGE_ID_FACEBOOK');

  if (!accessToken || !pageId) {
    return res.json({ error: 'Configuração Meta incompleta', impressions: 0, reach: 0, engagement: 0 });
  }
  try {
    const insightsRes = await axios.get(`${META_BASE}/${pageId}/insights`, {
      params: {
        metric: 'page_impressions,page_reach,page_engaged_users',
        period: 'month',
        access_token: accessToken
      }
    });
    res.json(insightsRes.data);
  } catch (err) {
    res.json({ error: 'Não foi possível buscar insights', data: [] });
  }
});

module.exports = router;
