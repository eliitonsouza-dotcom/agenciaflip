import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

export default function Clients() {
  const [clients, setClients] = useState([])
  const [search, setSearch] = useState('')

  const load = () => {
    axios.get(`/api/clients?search=${search}`).then(r => setClients(r.data))
  }
  useEffect(() => { load() }, [search])

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Clientes</div>
          <div className="page-sub">{clients.length} cliente(s) cadastrado(s)</div>
        </div>
        <Link to="/clientes/novo" className="btn btn-primary">
          <i className="fa-solid fa-plus" /> Novo cliente
        </Link>
      </div>

      <div style={{ marginBottom: 20 }}>
        <input placeholder="Buscar cliente..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 320 }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {clients.length === 0 && (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>
            <i className="fa-solid fa-users" />
            <p>Nenhum cliente encontrado</p>
          </div>
        )}
        {clients.map(c => (
          <div key={c.id} className="card" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
              {c.logo_path
                ? <img src={c.logo_path} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)' }} />
                : <div style={{ width: 48, height: 48, borderRadius: 8, background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 800, color: '#fff' }}>
                    {c.name[0]}
                  </div>
              }
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)' }}>{c.segment}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
              {c.social_facebook ? <span className="badge badge-gray"><i className="fa-brands fa-facebook" /> Facebook</span> : null}
              {c.social_instagram ? <span className="badge badge-gray"><i className="fa-brands fa-instagram" /> Instagram</span> : null}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to={`/nova-demanda?client=${c.id}`} className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', fontSize: 12 }}>
                <i className="fa-solid fa-plus" /> Demanda
              </Link>
              <Link to={`/clientes/${c.id}/editar`} className="btn btn-ghost" style={{ fontSize: 12 }}>
                <i className="fa-solid fa-pen" />
              </Link>
            </div>
            <span className="badge" style={{ position: 'absolute', top: 16, right: 16 }}
              className={`badge ${c.status === 'ativo' ? 'badge-green' : 'badge-gray'}`}>
              {c.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
