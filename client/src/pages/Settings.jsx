import React, { useState, useEffect } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'

const FIELDS = [
  { key: 'ANTHROPIC_API_KEY', label: 'Anthropic API Key (Claude)', icon: 'fa-robot', link: 'https://console.anthropic.com/' },
  { key: 'OPENAI_API_KEY', label: 'OpenAI API Key (DALL-E)', icon: 'fa-image', link: 'https://platform.openai.com/api-keys' },
  { key: 'META_ACCESS_TOKEN', label: 'Meta Access Token', icon: 'fa-meta', link: 'https://developers.facebook.com/' },
  { key: 'META_PAGE_ID_FACEBOOK', label: 'Facebook Page ID', icon: 'fa-facebook', link: null },
  { key: 'META_PAGE_ID_INSTAGRAM', label: 'Instagram Business Account ID', icon: 'fa-instagram', link: null },
]

export default function Settings() {
  const [settings, setSettings] = useState({})
  const [saving, setSaving] = useState(false)
  const [show, setShow] = useState({})

  useEffect(() => {
    axios.get('/api/settings').then(r => setSettings(r.data))
  }, [])

  const save = async () => {
    setSaving(true)
    try {
      await axios.put('/api/settings', settings)
      toast.success('Configurações salvas!')
    } catch { toast.error('Erro ao salvar') }
    finally { setSaving(false) }
  }

  const f = (k) => (e) => setSettings(p => ({ ...p, [k]: e.target.value }))

  return (
    <div style={{ maxWidth: 680 }}>
      <div className="page-header">
        <div>
          <div className="page-title">Configurações</div>
          <div className="page-sub">Chaves de API e dados da agência</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, marginBottom: 16, fontSize: 15 }}>
          <i className="fa-solid fa-building" style={{ marginRight: 8, color: 'var(--orange)' }} /> Agência
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Proprietário 1</label>
            <input value={settings.owner_1 || ''} onChange={f('owner_1')} placeholder="Tom" />
          </div>
          <div className="form-group">
            <label>Proprietária 2</label>
            <input value={settings.owner_2 || ''} onChange={f('owner_2')} placeholder="Jéssica" />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ fontWeight: 700, marginBottom: 4, fontSize: 15 }}>
          <i className="fa-solid fa-key" style={{ marginRight: 8, color: 'var(--orange)' }} /> Chaves de API
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 20 }}>
          As chaves ficam salvas localmente no banco de dados. Nunca compartilhe com terceiros.
        </div>

        {FIELDS.map(field => (
          <div key={field.key} className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span><i className={`fa-brands ${field.icon} fa-solid`} style={{ marginRight: 6, color: 'var(--orange)', width: 16 }} /> {field.label}</span>
              {field.link && (
                <a href={field.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--orange)' }}>
                  Obter chave <i className="fa-solid fa-arrow-up-right-from-square" style={{ fontSize: 9 }} />
                </a>
              )}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={show[field.key] ? 'text' : 'password'}
                value={settings[field.key] || ''}
                onChange={f(field.key)}
                placeholder={`Cole sua ${field.label}...`}
                style={{ paddingRight: 40, fontFamily: settings[field.key] ? 'var(--mono)' : 'var(--font)', fontSize: settings[field.key] ? 12 : 14 }}
              />
              <button onClick={() => setShow(p => ({ ...p, [field.key]: !p[field.key] }))}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 0 }}>
                <i className={`fa-solid ${show[field.key] ? 'fa-eye-slash' : 'fa-eye'}`} />
              </button>
            </div>
            {settings[field.key] && (
              <div style={{ fontSize: 11, color: 'var(--green)', marginTop: 3 }}>
                <i className="fa-solid fa-circle-check" style={{ marginRight: 4 }} /> Configurada
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-primary" onClick={save} disabled={saving} style={{ minWidth: 160, justifyContent: 'center' }}>
          {saving ? <><i className="fa-solid fa-spinner fa-spin" /> Salvando...</> : <><i className="fa-solid fa-floppy-disk" /> Salvar configurações</>}
        </button>
      </div>

      <div style={{ marginTop: 32, padding: '16px', background: 'var(--bg3)', borderRadius: 8, fontSize: 12, color: 'var(--text3)', textAlign: 'center' }}>
        <div style={{ color: 'var(--orange)', fontWeight: 700, marginBottom: 4 }}>AGÊNCIA FLIP 1.0 Beta</div>
        Tom & Jéssica · Todos os direitos reservados
      </div>
    </div>
  )
}
