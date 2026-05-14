import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { StatusBadge, statusLabel } from '../components/StatusBadge'

export default function DemandDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [demand, setDemand] = useState(null)
  const [scheduleForm, setScheduleForm] = useState({ scheduled_at: '', network: 'instagram', post_type: 'feed' })
  const [scheduling, setScheduling] = useState(false)
  const [publishing, setPublishing] = useState(false)

  const load = () => axios.get(`/api/demands/${id}`).then(r => setDemand(r.data))
  useEffect(() => { load() }, [id])

  const canSchedule = demand?.status === 'aprovado_cliente'
  const canPublish = demand?.status === 'agendado' && demand?.schedule

  const schedule = async () => {
    if (!scheduleForm.scheduled_at) return toast.error('Selecione data e hora')
    setScheduling(true)
    try {
      await axios.post('/api/schedules', { demand_id: id, ...scheduleForm })
      toast.success('Post agendado!')
      load()
    } catch (e) { toast.error(e.response?.data?.error || 'Erro ao agendar') }
    finally { setScheduling(false) }
  }

  const publish = async () => {
    if (!demand?.schedule?.id) return
    setPublishing(true)
    try {
      await axios.post(`/api/meta/publish/${demand.schedule.id}`)
      toast.success('Publicado!')
      load()
    } catch (e) { toast.error(e.response?.data?.error || 'Erro ao publicar') }
    finally { setPublishing(false) }
  }

  if (!demand) return <div className="loading"><i className="fa-solid fa-spinner fa-spin" /> Carregando...</div>

  const historyIcons = {
    rascunho: 'fa-file', aguardando_aprovacao_flip: 'fa-hourglass',
    aprovado_flip: 'fa-stamp', aguardando_aprovacao_cliente: 'fa-user-clock',
    aprovado_cliente: 'fa-user-check', agendado: 'fa-calendar-check', publicado: 'fa-paper-plane'
  }

  return (
    <div style={{ maxWidth: 960 }}>
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="page-title">{demand.client_name || demand.client_name_avulso || 'Demanda avulsa'}</div>
            <StatusBadge status={demand.status} />
          </div>
          <div className="page-sub">{demand.type} · {demand.objective}</div>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate(-1)}><i className="fa-solid fa-arrow-left" /> Voltar</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 24 }}>
        <div>
          {demand.image_url && (
            <div className="card" style={{ marginBottom: 20, padding: 12 }}>
              <img src={demand.image_url} style={{ width: '100%', borderRadius: 8 }} />
            </div>
          )}
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 13, color: 'var(--text2)' }}>Conteúdo</div>
            <div style={{ fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', marginBottom: 12 }}>{demand.caption}</div>
            {demand.cta && <div style={{ color: 'var(--orange)', fontSize: 13, marginBottom: 6 }}><strong>CTA:</strong> {demand.cta}</div>}
            {demand.hashtags && <div style={{ color: 'var(--text3)', fontSize: 12 }}>{demand.hashtags}</div>}
          </div>

          {demand.history?.length > 0 && (
            <div className="card">
              <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 13, color: 'var(--text2)' }}>
                <i className="fa-solid fa-timeline" style={{ marginRight: 6, color: 'var(--orange)' }} /> Histórico
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {demand.history.map((h, i) => (
                  <div key={h.id} style={{ display: 'flex', gap: 14, paddingBottom: i < demand.history.length - 1 ? 20 : 0, position: 'relative' }}>
                    {i < demand.history.length - 1 && (
                      <div style={{ position: 'absolute', left: 15, top: 32, bottom: 0, width: 1, background: 'var(--border)' }} />
                    )}
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--bg3)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <i className={`fa-solid ${historyIcons[h.to_status] || 'fa-circle'}`} style={{ fontSize: 12, color: 'var(--orange)' }} />
                    </div>
                    <div style={{ paddingTop: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{statusLabel(h.to_status)}</div>
                      <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>
                        {h.changed_by} · {new Date(h.changed_at).toLocaleString('pt-BR')}
                      </div>
                      {h.comment && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4, padding: '6px 10px', background: 'var(--bg3)', borderRadius: 6, borderLeft: '2px solid var(--orange)' }}>{h.comment}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 13, color: 'var(--text2)' }}>
              <i className="fa-solid fa-shield-check" style={{ marginRight: 6, color: 'var(--orange)' }} /> Selos de aprovação
            </div>
            {[
              { key: 'flip', label: 'Selo FLIP', approved: ['aprovado_flip', 'aguardando_aprovacao_cliente', 'aprovado_cliente', 'agendado', 'publicado'].includes(demand.status) },
              { key: 'client', label: 'Selo Cliente', approved: ['aprovado_cliente', 'agendado', 'publicado'].includes(demand.status) }
            ].map(s => (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: s.approved ? 'rgba(34,197,94,0.15)' : 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <i className={`fa-solid ${s.approved ? 'fa-check' : 'fa-lock'}`} style={{ color: s.approved ? 'var(--green)' : 'var(--text3)', fontSize: 14 }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: s.approved ? 'var(--green)' : 'var(--text3)' }}>{s.approved ? 'Aprovado' : 'Pendente'}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 13, color: 'var(--text2)' }}>
              <i className="fa-solid fa-calendar-plus" style={{ marginRight: 6, color: 'var(--orange)' }} /> Agendamento
            </div>

            {!canSchedule && demand.status !== 'agendado' && demand.status !== 'publicado' && (
              <div style={{ padding: '12px', background: 'var(--bg3)', borderRadius: 8, border: '1px dashed var(--border2)', fontSize: 13, color: 'var(--text3)', textAlign: 'center' }}>
                <i className="fa-solid fa-lock" style={{ display: 'block', fontSize: 24, marginBottom: 8 }} />
                Aguardando os 2 selos de aprovação
              </div>
            )}

            {canSchedule && !demand.schedule && (
              <>
                <div className="form-group">
                  <label>Data e hora</label>
                  <input type="datetime-local" value={scheduleForm.scheduled_at}
                    onChange={e => setScheduleForm(p => ({ ...p, scheduled_at: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Rede social</label>
                  <select value={scheduleForm.network} onChange={e => setScheduleForm(p => ({ ...p, network: e.target.value }))}>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Facebook</option>
                    <option value="ambos">Ambos</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Tipo</label>
                  <select value={scheduleForm.post_type} onChange={e => setScheduleForm(p => ({ ...p, post_type: e.target.value }))}>
                    <option value="feed">Feed</option>
                    <option value="story">Story</option>
                  </select>
                </div>
                <button className="btn btn-primary" onClick={schedule} disabled={scheduling} style={{ width: '100%', justifyContent: 'center' }}>
                  {scheduling ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-solid fa-calendar-plus" />} Agendar publicação
                </button>
              </>
            )}

            {demand.schedule && demand.status !== 'publicado' && (
              <div>
                <div style={{ padding: '12px', background: 'rgba(34,197,94,0.08)', borderRadius: 8, border: '1px solid rgba(34,197,94,0.2)', marginBottom: 12, fontSize: 13 }}>
                  <div style={{ color: 'var(--green)', fontWeight: 600, marginBottom: 4 }}><i className="fa-solid fa-calendar-check" style={{ marginRight: 6 }} /> Agendado</div>
                  <div style={{ color: 'var(--text2)' }}>{new Date(demand.schedule.scheduled_at).toLocaleString('pt-BR')}</div>
                  <div style={{ color: 'var(--text3)', fontSize: 12, marginTop: 2 }}>{demand.schedule.network} · {demand.schedule.post_type}</div>
                </div>
                <button className="btn btn-primary" onClick={publish} disabled={publishing} style={{ width: '100%', justifyContent: 'center' }}>
                  {publishing ? <i className="fa-solid fa-spinner fa-spin" /> : <i className="fa-brands fa-meta" />} Publicar agora
                </button>
              </div>
            )}

            {demand.status === 'publicado' && (
              <div style={{ padding: '12px', background: 'var(--bg3)', borderRadius: 8, textAlign: 'center', color: 'var(--text2)', fontSize: 13 }}>
                <i className="fa-solid fa-check-circle" style={{ color: 'var(--green)', fontSize: 24, display: 'block', marginBottom: 8 }} />
                Publicado em {demand.schedule?.published_at ? new Date(demand.schedule.published_at).toLocaleString('pt-BR') : '—'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
