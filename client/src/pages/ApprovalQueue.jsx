import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { StatusBadge } from '../components/StatusBadge'

const OWNERS = ['Tom', 'Jéssica']

export default function ApprovalQueue() {
  const [tab, setTab] = useState('flip')
  const [demands, setDemands] = useState([])
  const [modal, setModal] = useState(null)
  const [comment, setComment] = useState('')
  const [who, setWho] = useState('Tom')
  const [acting, setActing] = useState(false)

  const load = () => {
    const statusMap = {
      flip: 'aguardando_aprovacao_flip',
      cliente: 'aguardando_aprovacao_cliente',
      aprovados: 'aprovado_cliente'
    }
    axios.get(`/api/demands?status=${statusMap[tab]}`).then(r => setDemands(r.data))
  }

  useEffect(() => { load() }, [tab])

  const approve = async (id, type) => {
    setActing(true)
    try {
      const endpoint = type === 'flip' ? 'approve-flip' : 'approve-client'
      await axios.post(`/api/demands/${id}/${endpoint}`, { changed_by: who, comment })
      toast.success(type === 'flip' ? 'Aprovado pelo FLIP!' : 'Aprovado pelo cliente!')
      setModal(null); setComment('')
      load()
    } catch (e) { toast.error(e.response?.data?.error || 'Erro') }
    finally { setActing(false) }
  }

  const reject = async (id) => {
    setActing(true)
    try {
      await axios.post(`/api/demands/${id}/reject`, { changed_by: who, comment: comment || 'Devolvido para ajuste' })
      toast.success('Devolvido para ajuste')
      setModal(null); setComment('')
      load()
    } catch { toast.error('Erro') }
    finally { setActing(false) }
  }

  const tabs = [
    { key: 'flip', label: 'Aguardando FLIP', icon: 'fa-stamp' },
    { key: 'cliente', label: 'Aguardando cliente', icon: 'fa-user-check' },
    { key: 'aprovados', label: 'Aprovados', icon: 'fa-circle-check' }
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Fila de aprovação</div>
          <div className="page-sub">Gerencie os selos de aprovação</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 13, color: 'var(--text2)' }}>Atuando como:</span>
          <select value={who} onChange={e => setWho(e.target.value)} style={{ width: 'auto' }}>
            {OWNERS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid var(--border)', paddingBottom: 0 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '10px 18px', background: 'transparent', border: 'none',
            borderBottom: tab === t.key ? '2px solid var(--orange)' : '2px solid transparent',
            color: tab === t.key ? 'var(--orange)' : 'var(--text2)',
            fontWeight: tab === t.key ? 600 : 400, fontSize: 13, cursor: 'pointer',
            fontFamily: 'var(--font)', transition: 'all 0.15s'
          }}>
            <i className={`fa-solid ${t.icon}`} style={{ marginRight: 6 }} /> {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {demands.length === 0 && <div className="empty-state"><i className="fa-solid fa-check-circle" /><p>Nenhuma demanda nesta fila</p></div>}
        {demands.map(d => (
          <div key={d.id} className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            {d.image_url
              ? <img src={d.image_url} style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
              : <div style={{ width: 80, height: 80, borderRadius: 8, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <i className="fa-solid fa-image" style={{ color: 'var(--text3)' }} />
                </div>
            }
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{d.client_name || d.client_name_avulso || 'Avulso'}</span>
                <StatusBadge status={d.status} />
                <span className="badge badge-gray">{d.type}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>{d.objective}</div>
              {d.caption && <div style={{ fontSize: 12, color: 'var(--text3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.caption?.slice(0, 120)}...</div>}
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <Link to={`/demanda/${d.id}`} className="btn btn-ghost" style={{ fontSize: 12 }}>
                <i className="fa-solid fa-eye" /> Ver
              </Link>
              {tab === 'flip' && <>
                <button className="btn btn-danger" onClick={() => { setModal({ id: d.id, action: 'reject', type: 'flip' }); setComment('') }}>
                  <i className="fa-solid fa-rotate-left" /> Devolver
                </button>
                <button className="btn btn-success" onClick={() => { setModal({ id: d.id, action: 'approve', type: 'flip' }); setComment('') }}>
                  <i className="fa-solid fa-stamp" /> Aprovar FLIP
                </button>
              </>}
              {tab === 'cliente' && <>
                <button className="btn btn-danger" onClick={() => { setModal({ id: d.id, action: 'reject', type: 'cliente' }); setComment('') }}>
                  <i className="fa-solid fa-rotate-left" /> Devolver
                </button>
                <button className="btn btn-success" onClick={() => { setModal({ id: d.id, action: 'approve', type: 'cliente' }); setComment('') }}>
                  <i className="fa-solid fa-user-check" /> Aprovar cliente
                </button>
              </>}
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: 420 }}>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
              {modal.action === 'approve'
                ? `Confirmar aprovação (${modal.type === 'flip' ? 'FLIP' : 'Cliente'})`
                : 'Devolver para ajuste'}
            </div>
            <div className="form-group">
              <label>Comentário {modal.action === 'reject' ? '(obrigatório)' : '(opcional)'}</label>
              <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3} placeholder="Ex: Aprovado! Ficou excelente. / Ajustar a cor do texto..." />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancelar</button>
              {modal.action === 'approve'
                ? <button className="btn btn-success" onClick={() => approve(modal.id, modal.type)} disabled={acting}>
                    {acting ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-check" />} Confirmar aprovação
                  </button>
                : <button className="btn btn-danger" onClick={() => reject(modal.id)} disabled={acting || !comment}>
                    {acting ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-rotate-left" />} Devolver
                  </button>
              }
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
