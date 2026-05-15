import { useState } from 'react'
import { ObjectRenderer } from './JsonViewer'
import { countFields } from '../utils/formatters'

function CopyIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function ChevronIcon({ open }) {
  return (
    <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`}
      fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function CodeIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  )
}

export default function FullDataSection({ data }) {
  const [showJson, setShowJson] = useState(false)
  const [copied, setCopied] = useState(false)

  const { filled, empty } = countFields(data)
  const jsonStr = JSON.stringify(data, null, 2)

  function handleCopy() {
    navigator.clipboard.writeText(jsonStr).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="space-y-4">
      {/* Stats + Actions bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-slate-600">
              <span className="font-bold text-emerald-600">{filled}</span> campos preenchidos
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            <span className="text-slate-500">
              <span className="font-bold text-slate-400">{empty}</span> campos vazios
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowJson(v => !v)}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <CodeIcon />
            {showJson ? 'Ocultar JSON' : 'Ver JSON bruto'}
          </button>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors ${
              copied
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? 'Copiado!' : 'Copiar JSON'}
          </button>
        </div>
      </div>

      {/* Raw JSON */}
      {showJson && (
        <div className="bg-slate-900 rounded-xl overflow-auto shadow-md">
          <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">JSON bruto</span>
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <span className="w-3 h-3 rounded-full bg-green-500/70" />
            </div>
          </div>
          <pre className="text-xs text-emerald-300 p-4 overflow-x-auto leading-relaxed">
            {jsonStr}
          </pre>
        </div>
      )}

      {/* Structured full data */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-700">Dados completos da API</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Todos os campos retornados pela API, renderizados automaticamente.
          </p>
        </div>
        <div className="p-6">
          <ObjectRenderer obj={data} depth={0} />
        </div>
      </div>
    </div>
  )
}
