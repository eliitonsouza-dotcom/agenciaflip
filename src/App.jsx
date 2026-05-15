import { useState } from 'react'
import SearchBar from './components/SearchBar'
import CompanySummary from './components/CompanySummary'
import FullDataSection from './components/FullDataSection'
import ErrorAlert from './components/ErrorAlert'
import LoadingSkeleton from './components/LoadingSkeleton'

function BuildingIcon() {
  return (
    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )
}

function resolveError(err, status) {
  if (!navigator.onLine) return 'Sem conexão com a internet. Verifique sua rede.'
  if (status === 404) return 'CNPJ não encontrado na base de dados da Receita Federal.'
  if (status === 429) return 'Muitas consultas em sequência. Aguarde alguns segundos e tente novamente.'
  if (status >= 500) return 'Serviço da Receita Federal indisponível no momento. Tente mais tarde.'
  if (err instanceof TypeError) return 'Erro de conexão. Verifique sua internet ou tente novamente.'
  return 'Resposta inesperada da API. Tente novamente.'
}

export default function App() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  async function handleSearch(cnpj) {
    setLoading(true)
    setData(null)
    setError(null)

    try {
      const res = await fetch(`https://publica.cnpj.ws/cnpj/${cnpj}`)

      if (!res.ok) {
        setError(resolveError(null, res.status))
        return
      }

      let json
      try {
        json = await res.json()
      } catch {
        setError('A API retornou uma resposta inválida. Tente novamente.')
        return
      }

      if (!json || typeof json !== 'object') {
        setError('Resposta inesperada da API.')
        return
      }

      setData(json)
    } catch (err) {
      setError(resolveError(err, null))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white shrink-0">
            <BuildingIcon />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 leading-tight">Consulta CNPJ</h1>
            <p className="text-xs text-slate-400">Receita Federal do Brasil · API Pública</p>
          </div>
        </div>
      </header>

      {/* Search section */}
      <section className="bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <p className="text-sm text-slate-500 text-center mb-5">
            Consulte gratuitamente dados cadastrais de qualquer empresa brasileira.
          </p>
          <SearchBar onSearch={handleSearch} loading={loading} />
        </div>
      </section>

      {/* Results */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {loading && <LoadingSkeleton />}

        {!loading && error && <ErrorAlert message={error} />}

        {!loading && data && (
          <div className="space-y-6">
            <CompanySummary data={data} />
            <FullDataSection data={data} />
          </div>
        )}

        {!loading && !data && !error && (
          <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
            <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-4 text-slate-300">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="font-medium text-slate-500">Nenhuma consulta realizada ainda</p>
            <p className="text-sm mt-1">Informe um CNPJ acima para começar.</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 text-center text-xs text-slate-400">
          Dados fornecidos pela API pública{' '}
          <span className="font-mono">publica.cnpj.ws</span>.
          Uso exclusivo para fins informativos.
        </div>
      </footer>
    </div>
  )
}
