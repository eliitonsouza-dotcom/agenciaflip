import React, { useState, useEffect } from 'react'
import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import axios from 'axios'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import ClientForm from './pages/ClientForm'
import NewDemand from './pages/NewDemand'
import DemandDetail from './pages/DemandDetail'
import ApprovalQueue from './pages/ApprovalQueue'
import Planner from './pages/Planner'
import Traffic from './pages/Traffic'
import Settings from './pages/Settings'

const NAV = [
  { to: '/', icon: 'fa-gauge-high', label: 'Dashboard', exact: true },
  { to: '/clientes', icon: 'fa-users', label: 'Clientes' },
  { to: '/nova-demanda', icon: 'fa-plus-circle', label: 'Nova demanda' },
  { to: '/aprovacao', icon: 'fa-check-double', label: 'Aprovação', badge: true },
  { to: '/planner', icon: 'fa-calendar-days', label: 'Planner' },
  { to: '/trafego', icon: 'fa-chart-line', label: 'Tráfego' },
  { to: '/configuracoes', icon: 'fa-gear', label: 'Configurações' },
]

export default function App() {
  const [pending, setPending] = useState(0)
  const location = useLocation()

  useEffect(() => {
    axios.get('/api/demands/pending-counts').then(r => setPending(r.data.total)).catch(() => {})
  }, [location])

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <aside style={{
        width: 220, background: '#111', borderRight: '1px solid #1e1e1e',
        display: 'flex', flexDirection: 'column', flexShrink: 0
      }}>
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #1e1e1e' }}>
          <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: 1, color: '#FF6600', textTransform: 'uppercase' }}>
            AGÊNCIA FLIP
          </div>
          <span style={{
            fontSize: 10, fontWeight: 700, background: '#FF6600', color: '#fff',
            padding: '1px 6px', borderRadius: 4, letterSpacing: 0.5, marginTop: 4, display: 'inline-block'
          }}>1.0 BETA</span>
        </div>

        <nav style={{ flex: 1, padding: '12px 0' }}>
          {NAV.map(item => (
            <NavLink key={item.to} to={item.to} end={item.exact}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 20px', fontSize: 13, fontWeight: 500,
                color: isActive ? '#FF6600' : '#888',
                background: isActive ? 'rgba(255,102,0,0.08)' : 'transparent',
                borderLeft: `2px solid ${isActive ? '#FF6600' : 'transparent'}`,
                transition: 'all 0.15s', textDecoration: 'none'
              })}
            >
              <i className={`fa-solid ${item.icon}`} style={{ width: 16, textAlign: 'center' }} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && pending > 0 && (
                <span style={{
                  background: '#FF6600', color: '#fff', fontSize: 10, fontWeight: 700,
                  padding: '1px 6px', borderRadius: 10, minWidth: 18, textAlign: 'center'
                }}>{pending}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '16px 20px', borderTop: '1px solid #1e1e1e', fontSize: 11, color: '#444' }}>
          Tom & Jéssica · FLIP
        </div>
      </aside>

      <main style={{ flex: 1, overflow: 'auto', padding: '32px 36px' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/clientes" element={<Clients />} />
          <Route path="/clientes/novo" element={<ClientForm />} />
          <Route path="/clientes/:id/editar" element={<ClientForm />} />
          <Route path="/nova-demanda" element={<NewDemand />} />
          <Route path="/demanda/:id" element={<DemandDetail />} />
          <Route path="/aprovacao" element={<ApprovalQueue />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/trafego" element={<Traffic />} />
          <Route path="/configuracoes" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}
