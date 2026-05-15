export default function SituacaoBadge({ situacao }) {
  if (!situacao) return null

  const upper = String(situacao).toUpperCase()
  const isAtiva = upper === 'ATIVA'
  const isBaixa = upper === 'BAIXADA' || upper === 'BAIXA'
  const isSuspensa = upper.includes('SUSPENS') || upper.includes('INAPT')

  const cls = isAtiva
    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
    : isBaixa
      ? 'bg-slate-100 text-slate-600 border-slate-200'
      : isSuspensa
        ? 'bg-amber-100 text-amber-700 border-amber-200'
        : 'bg-red-100 text-red-700 border-red-200'

  const dot = isAtiva
    ? 'bg-emerald-500'
    : isBaixa
      ? 'bg-slate-400'
      : isSuspensa
        ? 'bg-amber-500'
        : 'bg-red-500'

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${cls}`}>
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      {situacao}
    </span>
  )
}
