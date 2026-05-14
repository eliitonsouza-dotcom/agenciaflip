import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useLocalStorage } from '../hooks/useLocalStorage'

const TYPES = ['Post feed', 'Story', 'Reels', 'Promocional', 'Institucional', 'Carrossel']

const FORM_DEFAULT = {
  client_id: '',
  client_name_avulso: '',
  briefing_avulso: '',
  type: 'Post feed',
  objective: '',
  notes: ''
}

export default function NewDemand() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const [clients, setClients] = useState([])
  const [isAvulso, setIsAvulso, clearIsAvulso] = useLocalStorage('flip_new_demand_avulso', false)
  const [form, setForm, clearForm] = useLocalStorage('flip_new_demand_form', { ...FORM_DEFAULT, client_id: params.get('client') || '' })
  const [generating, setGenerating] = useState(false)
  const [result, setResult, clearResult] = useLocalStorage('flip_new_demand_result', null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    axios.get('/api/clients?status=ativo').then(r => setClients(r.data))
  }, [])

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const generate = async () => {
    if (!form.objective) return toast.error('Descreva o objetivo da peça')
    if (!isAvulso && !form.client_id) return toast.error('Selecione um cliente')
    if (isAvulso && !form.client_name_avulso) return toast.error('Informe o nome do cliente avulso')

    setGenerating(true)
    setResult(null)
    try {
      const r = await axios.post('/api/ai/generate', {
        client_id: form.client_id || null,
        is_avulso: isAvulso,
        briefing_avulso: form.briefing_avulso,
        type: form.type,
        objective: form.objective,
        notes: form.notes
      })
      setResult(r.data)
      toast.success('Conteúdo gerado!')
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erro ao gerar conteúdo')
    } finally { setGenerating(false) }
  }

  const regenerateImage = async () => {
    if (!result?.image_prompt) return
    setGenerating(true)
    try {
      const r = await axios.post('/api/ai/regenerate-image', { image_prompt: result.image_prompt })
      setResult(p => ({ ...p, image_url: r.data.image_url }))
      toast.success('Nova imagem gerada!')
    } catch { toast.error('Erro ao regenerar imagem') }
    finally { setGenerating(false) }
  }

  const saveDemand = async () => {
    if (!result) return toast.error('Gere o conteúdo primeiro')
    setSaving(true)
    try {
      const r = await axios.post('/api/demands', {
        client_id: isAvulso ? null : form.client_id,
        is_avulso: isAvulso,
        client_name_avulso: isAvulso ? form.client_name_avulso : null,
        briefing_avulso: isAvulso ? form.briefing_avulso : null,
        type: form.type,
        objective: form.objective,
        notes: form.notes,
        caption: result.caption,
        hashtags: result.hashtags,
        cta: result.cta,
        image_url: result.image_url
      })
      const demandId = r.data.id
      await axios.post(`/api/demands/${demandId}/submit`)
      clearForm()
      clearResult()
      clearIsAvulso()
      toast.success('Demanda enviada para aprovação!')
      navigate(`/demanda/${demandId}`)
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erro ao salvar')
    } finally { setSaving(false) }
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <div className="page-header">
        <div>
          <div className="page-title">Nova demanda</div>
          <div className="page-sub">Gere conteúdo com IA usando o briefing do cliente</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? '1fr 1fr' : '1fr', gap: 24 }}>
        <div>
          <div className="card">
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text)', marginBottom: 0 }}>
                <input type="checkbox" checked={isAvulso} onChange={e => setIsAvulso(e.target.checked)} style={{ width: 'auto', accentColor: 'var(--orange)' }} />
                <span style={{ fontSize: 13 }}>Demanda avulsa (sem cliente cadastrado)</span>
              </label>
            </div>

            {!isAvulso ? (
              <div className="form-group">
                <label>Cliente *</label>
                <select value={form.client_id} onChange={f('client_id')}>
                  <option value="">Selecione o cliente...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label>Nome do cliente avulso *</label>
                  <input value={form.client_name_avulso} onChange={f('client_name_avulso')} placeholder="Nome para identificação" />
                </div>
                <div className="form-group">
                  <label>Briefing para esta demanda</label>
                  <textarea rows={4} value={form.briefing_avulso} onChange={f('briefing_avulso')} placeholder="Tom de voz, público, objetivo da marca, cores..." />
                </div>
              </>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>Tipo de conteúdo *</label>
                <select value={form.type} onChange={f('type')}>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Objetivo da peça *</label>
              <input value={form.objective} onChange={f('objective')} placeholder="Ex: Divulgar promoção de quinta com 20% off no almoço executivo" />
            </div>

            <div className="form-group">
              <label>Observações adicionais</label>
              <textarea rows={3} value={form.notes} onChange={f('notes')} placeholder="Informações extras, referências, datas importantes..." />
            </div>

            <button className="btn btn-primary" onClick={generate} disabled={generating} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
              {generating
                ? <><i className="fa-solid fa-spinner fa-spin" /> Gerando com IA...</>
                : <><i className="fa-solid fa-wand-magic-sparkles" /> Gerar conteúdo</>}
            </button>
          </div>
        </div>

        {result && (
          <div>
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 12, color: 'var(--text2)', fontSize: 13 }}>
                <i className="fa-solid fa-image" style={{ marginRight: 6, color: 'var(--orange)' }} /> Imagem gerada
              </div>
              {result.image_url
                ? <img src={result.image_url} style={{ width: '100%', borderRadius: 8, marginBottom: 10 }} />
                : <div style={{ background: 'var(--bg3)', borderRadius: 8, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, color: 'var(--text3)' }}>
                    <div style={{ textAlign: 'center' }}>
                      <i className="fa-solid fa-image" style={{ fontSize: 32, marginBottom: 8 }} />
                      <div style={{ fontSize: 12 }}>Configure OPENAI_API_KEY para gerar imagens</div>
                    </div>
                  </div>
              }
              <button className="btn btn-ghost" onClick={regenerateImage} disabled={generating} style={{ width: '100%', justifyContent: 'center', fontSize: 12 }}>
                <i className="fa-solid fa-rotate" /> Gerar nova imagem
              </button>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 10, color: 'var(--text2)', fontSize: 13 }}>
                <i className="fa-solid fa-align-left" style={{ marginRight: 6, color: 'var(--orange)' }} /> Legenda
              </div>
              <textarea rows={6} value={result.caption} onChange={e => setResult(p => ({ ...p, caption: e.target.value }))} />
              <div style={{ marginTop: 10 }}>
                <label>CTA</label>
                <input value={result.cta} onChange={e => setResult(p => ({ ...p, cta: e.target.value }))} />
              </div>
              <div style={{ marginTop: 10 }}>
                <label>Hashtags</label>
                <input value={result.hashtags} onChange={e => setResult(p => ({ ...p, hashtags: e.target.value }))} />
              </div>
            </div>

            <button className="btn btn-primary" onClick={saveDemand} disabled={saving} style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
              {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Salvando...</> : <><i className="fa-solid fa-paper-plane" /> Enviar para aprovação</>}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
