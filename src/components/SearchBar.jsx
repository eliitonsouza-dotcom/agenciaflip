import { useState } from 'react'
import { maskCNPJ, isValidCNPJ } from '../utils/formatters'

function SearchIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}

export default function SearchBar({ onSearch, loading }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  function handleChange(e) {
    const masked = maskCNPJ(e.target.value)
    setValue(masked)
    if (error) setError('')
  }

  function handleSubmit(e) {
    e.preventDefault()
    const digits = value.replace(/\D/g, '')

    if (digits.length === 0) {
      setError('Informe um CNPJ para consultar.')
      return
    }
    if (digits.length !== 14) {
      setError('O CNPJ deve ter 14 dígitos.')
      return
    }
    if (!isValidCNPJ(digits)) {
      setError('CNPJ inválido. Verifique os dígitos informados.')
      return
    }

    setError('')
    onSearch(digits)
  }

  const isComplete = value.replace(/\D/g, '').length === 14

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} noValidate>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label htmlFor="cnpj-input" className="block text-sm font-medium text-slate-600 mb-1.5">
              CNPJ da empresa
            </label>
            <input
              id="cnpj-input"
              type="text"
              inputMode="numeric"
              placeholder="00.000.000/0000-00"
              value={value}
              onChange={handleChange}
              disabled={loading}
              maxLength={18}
              className={`w-full px-4 py-3 text-lg font-mono tracking-wider rounded-xl border-2 transition-colors outline-none
                bg-white shadow-sm
                ${error
                  ? 'border-red-400 focus:border-red-500'
                  : isComplete
                    ? 'border-emerald-400 focus:border-emerald-500'
                    : 'border-slate-200 focus:border-blue-400'}
                ${loading ? 'opacity-60 cursor-not-allowed' : ''}
              `}
            />
            {error && (
              <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                <span className="inline-block w-4 h-4 text-red-500">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </span>
                {error}
              </p>
            )}
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-sm
                ${loading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}
              `}
            >
              {loading ? <SpinnerIcon /> : <SearchIcon />}
              {loading ? 'Consultando...' : 'Consultar'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
