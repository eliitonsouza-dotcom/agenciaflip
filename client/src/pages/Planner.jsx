import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const CLIENT_COLORS = ['#FF6600','#6366f1','#22c55e','#ec4899','#f59e0b','#06b6d4','#8b5cf6','#ef4444','#10b981','#f97316']

export default function Planner() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [schedules, setSchedules] = useState([])
  const [clientColors, setClientColors] = useState({})

  useEffect(() => {
    const m = String(currentDate.getMonth() + 1).padStart(2, '0')
    const y = currentDate.getFullYear()
    axios.get(`/api/schedules?month=${m}&year=${y}`).then(r => {
      setSchedules(r.data)
      const colors = {}
      let i = 0
      r.data.forEach(s => {
        const key = s.client_id || s.client_name_avulso || 'avulso'
        if (!colors[key]) { colors[key] = CLIENT_COLORS[i % CLIENT_COLORS.length]; i++ }
      })
      setClientColors(colors)
    })
  }, [currentDate])

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startPad = getDay(monthStart)
  const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const getColor = (s) => clientColors[s.client_id || s.client_name_avulso || 'avulso'] || '#FF6600'

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Planner</div>
          <div className="page-sub">Calendário de publicações</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-ghost" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
            <i className="fa-solid fa-chevron-left" />
          </button>
          <span style={{ fontWeight: 700, fontSize: 16, minWidth: 160, textAlign: 'center' }}>
            {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
          </span>
          <button className="btn btn-ghost" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
            <i className="fa-solid fa-chevron-right" />
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
          {WEEKDAYS.map(d => (
            <div key={d} style={{ padding: '10px', textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text3)', background: 'var(--bg3)' }}>{d}</div>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {Array(startPad).fill(null).map((_, i) => (
            <div key={`pad-${i}`} style={{ minHeight: 90, borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--bg3)', opacity: 0.4 }} />
          ))}
          {days.map((day, i) => {
            const daySchedules = schedules.filter(s => isSameDay(new Date(s.scheduled_at), day))
            const isToday = isSameDay(day, new Date())
            return (
              <div key={day.toString()} style={{
                minHeight: 90, padding: '8px 6px',
                borderRight: (startPad + i + 1) % 7 === 0 ? 'none' : '1px solid var(--border)',
                borderBottom: '1px solid var(--border)',
                background: isToday ? 'rgba(255,102,0,0.05)' : 'transparent'
              }}>
                <div style={{
                  fontSize: 12, fontWeight: isToday ? 700 : 400,
                  color: isToday ? 'var(--orange)' : 'var(--text3)',
                  marginBottom: 4
                }}>{format(day, 'd')}</div>
                {daySchedules.map(s => (
                  <Link key={s.id} to={`/demanda/${s.demand_id}`} style={{ display: 'block', textDecoration: 'none', marginBottom: 3 }}>
                    <div style={{
                      background: getColor(s) + '22', border: `1px solid ${getColor(s)}44`,
                      borderLeft: `3px solid ${getColor(s)}`,
                      borderRadius: 4, padding: '2px 5px', fontSize: 10, lineHeight: 1.3,
                      color: 'var(--text)', overflow: 'hidden', cursor: 'pointer'
                    }}>
                      <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {s.client_name || s.client_name_avulso || 'Avulso'}
                      </div>
                      <div style={{ color: 'var(--text3)', fontSize: 9 }}>
                        {format(new Date(s.scheduled_at), 'HH:mm')} · {s.network}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )
          })}
        </div>
      </div>

      {Object.keys(clientColors).length > 0 && (
        <div style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {Object.entries(clientColors).map(([key, color]) => {
            const s = schedules.find(s => (s.client_id || s.client_name_avulso || 'avulso') === key)
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text2)' }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: color }} />
                {s?.client_name || s?.client_name_avulso || 'Avulso'}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
