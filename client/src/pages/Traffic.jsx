import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function Traffic() {
  const [campaigns, setCampaigns] = useState([])
  const [clients, setClients] = useState([])
  const [published, setPublished] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ client_id: '', demand_id: '', name: '', objective: 'AWARENESS', budget_daily: '', start_date: '', end_date: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    axios.get('/api/campaigns').then(r => setCampaigns(r.data))
    axios.get('/api/clients?status=ativo').then(r => setClients(r.data))
    axios.get('/api/demands?status=publicado').then(r => setPublished(r.data))
  }, [])

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const save = async () => {
    if (!form.name || !form.client_id) return toast.error('Nome e cliente são obrigatórios')
    setSaving(true)
    try {
      await axios.post('/api/campaigns', form)
      toast.success('Campanha criada!')
      setShowForm(false)
      axios.get('/api/campaigns').then(r => setCampaigns(r.data))
    } catch { toast.error('Erro ao criar campanha') }
    finally { setSaving(false) }
  }

  const statusColor = { ativo: 'var(--green)', pausado: 'var(--yellow)', encerrado: 'var(--text3)' }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Tráfego pago</div>
          <div className="page-sub">Campanhas Facebook Ads via MCP</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <i className="fa-solid fa-plus" /> Nova campanha
        </button>
      </div>

      <div style={{ background: 'rgba(255,102,0,0.06)', border: '1px solid rgba(255,102,0,0.2)', borderRadius: 8, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <i className="fa-brands fa-meta" style={{ color: 'var(--orange)', fontSize: 16 }} />
        <span>Integração ativa com <strong style={{ color: 'var(--orange)' }}>Facebook Ads MCP</strong> — configure META_ACCESS_TOKEN em Configurações para publicar e criar campanhas automaticamente.</span>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 700, marginBottom: 16 }}>Nova campanha</div>
          <div className="form-row">
            <div className="form-group">
              <label>Nome da campanha *</label>
              <input value={form.name} onChange={f('name')} placeholder="Ex: Promo Julho - Sabor & Arte" />
            </div>
            <div className="form-group">
              <label>Cliente *</label>
              <select value={form.client_id} onChange={f('client_id')}>
                <option value="">Selecione...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Objetivo</label>
              <select value={form.objective} onChange={f('objective')}>
                {['AWARENESS','REACH','TRAFFIC','ENGAGEMENT','LEADS','SALES'].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Orçamento diário (R$)</label>
              <input type="number" value={form.budget_daily} onChange={f('budget_daily')} placeholder="Ex: 30" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Início</label>
              <input type="date" value={form.start_date} onChange={f('start_date')} />
            </div>
            <div className="form-group">
              <label>Fim</label>
              <input type="date" value={form.end_date} onChange={f('end_date')} />
            </div>
          </div>
          <div className="form-group">
            <label>Post publicado (criativo)</label>
            <select value={form.demand_id} onChange={f('demand_id')}>
              <option value="">Selecione um post publicado...</option>
              {published.map(d => <option key={d.id} value={d.id}>{d.client_name || d.client_name_avulso} · {d.type} · {d.objective?.slice(0, 40)}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={save} disabled={saving}>
              {saving ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-check" />} Criar campanha
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {campaigns.length === 0 && <div className="empty-state"><i className="fa-solid fa-chart-line" /><p>Nenhuma campanha criada ainda</p></div>}
        {campaigns.map(c => (
          <div key={c.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 8, background: 'rgba(255,102,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <i className="fa-brands fa-meta" style={{ color: 'var(--orange)', fontSize: 20 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{c.client_name} · {c.objective} · {c.budget_daily ? `R$ ${c.budget_daily}/dia` : 'Orçamento não definido'}</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--text3)' }}>
              {c.start_date && <div>{c.start_date} → {c.end_date || '∞'}</div>}
              <div style={{ color: statusColor[c.status] || 'var(--text3)', fontWeight: 600, marginTop: 2 }}>{c.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
