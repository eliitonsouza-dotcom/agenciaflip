import React from 'react'

export const statusLabel = (s) => ({
  rascunho: 'Rascunho',
  aguardando_aprovacao_flip: 'Ag. FLIP',
  aprovado_flip: 'Aprovado FLIP',
  aguardando_aprovacao_cliente: 'Ag. cliente',
  aprovado_cliente: 'Aprovado',
  agendado: 'Agendado',
  publicado: 'Publicado'
}[s] || s)

export const statusClass = (s) => ({
  rascunho: 'badge-gray',
  aguardando_aprovacao_flip: 'badge-yellow',
  aprovado_flip: 'badge-orange',
  aguardando_aprovacao_cliente: 'badge-yellow',
  aprovado_cliente: 'badge-green',
  agendado: 'badge-green',
  publicado: 'badge-gray'
}[s] || 'badge-gray')

export function StatusBadge({ status }) {
  return <span className={`badge ${statusClass(status)}`}>{statusLabel(status)}</span>
}
