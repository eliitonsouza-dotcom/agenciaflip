const express = require('express');
const axios = require('axios');
const getConfig = require('../utils/getConfig');
const router = express.Router();

router.post('/generate', async (req, res) => {
  const { client_id, is_avulso, briefing_avulso, type, objective, notes } = req.body;
  const db = require('../db/database');

  const anthropicKey = getConfig('ANTHROPIC_API_KEY');
  if (!anthropicKey) {
    return res.status(400).json({ error: 'ANTHROPIC_API_KEY não configurada. Acesse Configurações para adicionar sua chave.' });
  }

  let briefing = briefing_avulso || '';
  let clientName = 'Cliente avulso';

  if (client_id && !is_avulso) {
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(client_id);
    if (client) {
      briefing = client.briefing || '';
      clientName = client.name;
    }
  }

  const prompt = `Você é um redator especialista em marketing digital para redes sociais. Crie conteúdo profissional e envolvente.

BRIEFING DO CLIENTE: ${clientName}
${briefing}

DEMANDA:
- Tipo de conteúdo: ${type}
- Objetivo: ${objective}
${notes ? `- Observações: ${notes}` : ''}

Crie o conteúdo para publicação nas redes sociais. Responda APENAS em JSON válido, sem markdown, com este formato exato:
{
  "caption": "texto completo da legenda com quebras de linha naturais",
  "cta": "chamada para ação curta e direta",
  "hashtags": "#hashtag1 #hashtag2 #hashtag3 (até 10 hashtags relevantes)",
  "image_prompt": "descrição detalhada em inglês para geração da imagem, incluindo estilo, cores e elementos visuais"
}`;

  try {
    const claudeRes = await axios.post('https://api.anthropic.com/v1/messages', {
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    }, {
      headers: {
        'x-api-key': anthropicKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      }
    });

    const text = claudeRes.data.content[0].text;
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : { caption: text, cta: '', hashtags: '', image_prompt: objective };
    }

    let image_url = null;
    const openaiKey = getConfig('OPENAI_API_KEY');

    if (openaiKey && parsed.image_prompt) {
      try {
        const dalleRes = await axios.post('https://api.openai.com/v1/images/generations', {
          model: 'dall-e-3',
          prompt: `${parsed.image_prompt}. Style: professional social media marketing, high quality, vibrant.`,
          n: 1,
          size: '1024x1024',
          quality: 'standard'
        }, {
          headers: {
            'Authorization': `Bearer ${openaiKey}`,
            'Content-Type': 'application/json'
          }
        });
        image_url = dalleRes.data.data[0].url;
      } catch (imgErr) {
        console.error('Erro ao gerar imagem:', imgErr.response?.data || imgErr.message);
      }
    }

    res.json({
      caption: parsed.caption || '',
      cta: parsed.cta || '',
      hashtags: parsed.hashtags || '',
      image_url,
      image_prompt: parsed.image_prompt || ''
    });

  } catch (err) {
    console.error('Erro na API Claude:', err.response?.data || err.message);
    res.status(500).json({ error: 'Erro ao gerar conteúdo com IA. Verifique sua chave de API.' });
  }
});

router.post('/regenerate-image', async (req, res) => {
  const { image_prompt } = req.body;
  const openaiKey = getConfig('OPENAI_API_KEY');
  if (!openaiKey) {
    return res.status(400).json({ error: 'OPENAI_API_KEY não configurada.' });
  }
  try {
    const dalleRes = await axios.post('https://api.openai.com/v1/images/generations', {
      model: 'dall-e-3',
      prompt: `${image_prompt}. Style: professional social media marketing, high quality, vibrant.`,
      n: 1,
      size: '1024x1024',
      quality: 'standard'
    }, {
      headers: { 'Authorization': `Bearer ${openaiKey}`, 'Content-Type': 'application/json' }
    });
    res.json({ image_url: dalleRes.data.data[0].url });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao regenerar imagem.' });
  }
});

module.exports = router;
