export function formatCNPJ(value) {
  const digits = String(value).replace(/\D/g, '')
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

export function formatCPF(value) {
  const digits = String(value).replace(/\D/g, '')
  return digits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
}

export function formatCEP(value) {
  const digits = String(value).replace(/\D/g, '')
  return digits.replace(/^(\d{5})(\d{3})$/, '$1-$2')
}

export function formatPhone(value) {
  const digits = String(value).replace(/\D/g, '')
  if (digits.length === 11) return digits.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
  if (digits.length === 10) return digits.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3')
  return value
}

export function formatDate(value) {
  if (!value) return null
  // ISO date string YYYY-MM-DD
  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(value))
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`
  // Already BR format
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(String(value))) return value
  return value
}

export function formatCurrency(value) {
  const num = parseFloat(value)
  if (isNaN(num)) return value
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function formatBoolean(value) {
  if (value === true) return 'Sim'
  if (value === false) return 'Não'
  return value
}

// Detects and auto-formats common field values by key name
export function autoFormat(key, value) {
  if (value === null || value === undefined || value === '') return null

  const k = key.toLowerCase()

  if (typeof value === 'boolean') return formatBoolean(value)

  if (typeof value === 'string' || typeof value === 'number') {
    const str = String(value)

    if (k.includes('cnpj') && /^\d{14}$/.test(str.replace(/\D/g, '')))
      return formatCNPJ(str)

    if (k.includes('cpf') && /^\d{11}$/.test(str.replace(/\D/g, '')))
      return formatCPF(str)

    if ((k.includes('cep') || k === 'cep') && /^\d{8}$/.test(str.replace(/\D/g, '')))
      return formatCEP(str)

    if ((k.includes('telefone') || k.includes('phone') || k.includes('fone')) &&
        /^\d{10,11}$/.test(str.replace(/\D/g, '')))
      return formatPhone(str)

    if ((k.includes('capital') || k.includes('valor') || k.includes('capital_social')) &&
        !isNaN(parseFloat(str)))
      return formatCurrency(str)

    if (k.includes('data') || k.includes('date') || k.includes('abertura'))
      return formatDate(str)
  }

  return String(value)
}

export function maskCNPJ(raw) {
  const digits = raw.replace(/\D/g, '').slice(0, 14)
  let r = digits
  if (digits.length > 2)  r = digits.slice(0, 2) + '.' + digits.slice(2)
  if (digits.length > 5)  r = digits.slice(0, 2) + '.' + digits.slice(2, 5) + '.' + digits.slice(5)
  if (digits.length > 8)  r = digits.slice(0, 2) + '.' + digits.slice(2, 5) + '.' + digits.slice(5, 8) + '/' + digits.slice(8)
  if (digits.length > 12) r = digits.slice(0, 2) + '.' + digits.slice(2, 5) + '.' + digits.slice(5, 8) + '/' + digits.slice(8, 12) + '-' + digits.slice(12)
  return r
}

// Mod-11 CNPJ validation
export function isValidCNPJ(value) {
  const digits = value.replace(/\D/g, '')
  if (digits.length !== 14) return false
  if (/^(\d)\1+$/.test(digits)) return false

  const calc = (d, weights) =>
    d.split('').reduce((acc, n, i) => acc + parseInt(n) * weights[i], 0)

  const w1 = [5,4,3,2,9,8,7,6,5,4,3,2]
  const r1 = calc(digits.slice(0, 12), w1) % 11
  const d1 = r1 < 2 ? 0 : 11 - r1

  const w2 = [6,5,4,3,2,9,8,7,6,5,4,3,2]
  const r2 = calc(digits.slice(0, 13), w2) % 11
  const d2 = r2 < 2 ? 0 : 11 - r2

  return parseInt(digits[12]) === d1 && parseInt(digits[13]) === d2
}

export function friendlyLabel(key) {
  return key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/\b\w/g, c => c.toUpperCase())
}

export function countFields(obj, counts = { filled: 0, empty: 0 }) {
  if (obj === null || obj === undefined) return counts
  if (Array.isArray(obj)) {
    obj.forEach(item => countFields(item, counts))
  } else if (typeof obj === 'object') {
    Object.values(obj).forEach(v => countFields(v, counts))
  } else {
    if (obj === '' || obj === null || obj === undefined) counts.empty++
    else counts.filled++
  }
  return counts
}
