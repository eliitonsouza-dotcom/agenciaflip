import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { StatusBadge, statusLabel } from '../components/StatusBadge'

export default function Dashboard() {
  const [counts, setCounts] = useState({ flip: 0, cliente: 0, total: 0 })
  const [recent, setRecent] = useState([])
  const [scheduled, setScheduled] = useState([])
  const [published, setPublished] = useState(0)

  useEffect(() => {
    axios.get('/api/demands/pending-counts').then(r => setCounts(r.data))
    axios.get('/api/demands?limit=6').then(r => setRecent(r.data))
    axios.get('/api/demands?status=agendado').then(r => setScheduled(r.data))
    axios.get('/api/demands?status=publicado').then(r => setPublished(r.data.length))
  }, [])

  const metrics = [
    { label: 'Pendentes de aprovação', value: counts.total, icon: 'fa-hourglass-half', color: '#FF6600' },
    { label: 'Agendados esta semana', value: scheduled.length, icon: 'fa-calendar-check', color: '#22c55e' },
    { label: 'Publicados este mês', value: published, icon: 'fa-paper-plane', color: '#6366f1' },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub">Bom dia, Tom e Jéssica 👋</div>
        </div>
        <Link to="/nova-demanda" className="btn btn-primary">
          <i className="fa-solid fa-plus" /> Nova demanda
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 32 }}>
        {metrics.map(m => (
          <div key={m.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 10, background: m.color + '20',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <i className={`fa-solid ${m.icon}`} style={{ color: m.color, fontSize: 20 }} />
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 700 }}>{m.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>{m.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: 'var(--text2)' }}>
            <i className="fa-solid fa-clock" style={{ marginRight: 8, color: 'var(--orange)' }} />
            Últimas demandas
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recent.length === 0 && <div className="empty-state"><p>Nenhuma demanda ainda</p></div>}
            {recent.map(d => (
              <Link key={d.id} to={`/demanda/${d.id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'border-color 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--orange)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  {d.image_url
                    ? <img src={d.image_url} style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                    : <div style={{ width: 40, height: 40, borderRadius: 6, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <i className="fa-solid fa-image" style={{ color: 'var(--text3)' }} />
                      </div>
                  }
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {d.client_name || d.client_name_avulso || 'Avulso'}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{d.type} · {d.objective?.slice(0, 40)}...</div>
                  </div>
                  <StatusBadge status={d.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, color: 'var(--text2)' }}>
            <i className="fa-solid fa-calendar-days" style={{ marginRight: 8, color: 'var(--orange)' }} />
            Agendados
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {scheduled.length === 0 && <div className="empty-state"><p>Nenhum post agendado</p></div>}
            {scheduled.map(d => (
              <Link key={d.id} to={`/demanda/${d.id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ padding: '14px 16px' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--orange)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{d.client_name || d.client_name_avulso || 'Avulso'}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{d.type}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
