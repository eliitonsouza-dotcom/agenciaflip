import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function ClientForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [form, setForm] = useState({
    name: '', segment: '', briefing: '',
    social_facebook: true, social_instagram: true, status: 'ativo'
  })
  const [logo, setLogo] = useState(null)
  const [preview, setPreview] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (isEdit) {
      axios.get(`/api/clients/${id}`).then(r => {
        setForm({ ...r.data, social_facebook: !!r.data.social_facebook, social_instagram: !!r.data.social_instagram })
        if (r.data.logo_path) setPreview(r.data.logo_path)
      })
    }
  }, [id])

  const handleLogo = (e) => {
    const f = e.target.files[0]
    if (f) { setLogo(f); setPreview(URL.createObjectURL(f)) }
  }

  const save = async () => {
    if (!form.name) return toast.error('Nome é obrigatório')
    setSaving(true)
    try {
      const data = new FormData()
      Object.entries(form).forEach(([k, v]) => data.append(k, v))
      if (logo) data.append('logo', logo)
      if (isEdit) await axios.put(`/api/clients/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
      else await axios.post('/api/clients', data, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success(isEdit ? 'Cliente atualizado!' : 'Cliente criado!')
      navigate('/clientes')
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erro ao salvar')
    } finally { setSaving(false) }
  }

  const f = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))
  const fc = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.checked }))

  return (
    <div style={{ maxWidth: 680 }}>
      <div className="page-header">
        <div>
          <div className="page-title">{isEdit ? 'Editar cliente' : 'Novo cliente'}</div>
          <div className="page-sub">Preencha os dados e briefing do cliente</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, padding: '0 0 24px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ position: 'relative' }}>
            {preview
              ? <img src={preview} style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover', border: '1px solid var(--border)' }} />
              : <div style={{ width: 80, height: 80, borderRadius: 12, background: 'var(--bg3)', border: '2px dashed var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className="fa-solid fa-image" style={{ color: 'var(--text3)', fontSize: 24 }} />
                </div>
            }
          </div>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Logo do cliente</div>
            <label className="btn btn-ghost" style={{ cursor: 'pointer', display: 'inline-flex' }}>
              <i className="fa-solid fa-upload" /> Fazer upload
              <input type="file" accept="image/*" onChange={handleLogo} style={{ display: 'none' }} />
            </label>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>JPG ou PNG, máx 5MB</div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Nome do cliente *</label>
            <input value={form.name} onChange={f('name')} placeholder="Ex: Restaurante Sabor & Arte" />
          </div>
          <div className="form-group">
            <label>Segmento</label>
            <input value={form.segment} onChange={f('segment')} placeholder="Ex: Restaurante, Clínica, Varejo..." />
          </div>
        </div>

        <div className="form-group">
          <label>Briefing do cliente</label>
          <textarea rows={8} value={form.briefing} onChange={f('briefing')}
            placeholder="Tom de voz, público-alvo, produto principal, cores da marca, restrições..." />
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>
            Este briefing será injetado automaticamente em todos os prompts de IA para este cliente.
          </div>
        </div>

        <div className="form-group">
          <label>Redes sociais ativas</label>
          <div style={{ display: 'flex', gap: 20, marginTop: 4 }}>
            {[['social_facebook', 'fa-facebook', 'Facebook'], ['social_instagram', 'fa-instagram', 'Instagram']].map(([key, icon, label]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', color: 'var(--text)' }}>
                <input type="checkbox" checked={form[key]} onChange={fc(key)} style={{ width: 'auto', accentColor: 'var(--orange)' }} />
                <i className={`fa-brands ${icon}`} /> {label}
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Status</label>
          <select value={form.status} onChange={f('status')} style={{ width: 'auto' }}>
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: '1px solid var(--border)' }}>
          <button className="btn btn-ghost" onClick={() => navigate('/clientes')}>Cancelar</button>
          <button className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Salvando...</> : <><i className="fa-solid fa-check" /> Salvar cliente</>}
          </button>
        </div>
      </div>
    </div>
  )
}
