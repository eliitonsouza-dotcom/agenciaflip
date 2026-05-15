import { autoFormat, friendlyLabel } from '../utils/formatters'

// Renders a single primitive value with optional auto-formatting
function PrimitiveValue({ fieldKey, value }) {
  if (value === null || value === undefined) {
    return <span className="text-slate-300 italic text-xs">nulo</span>
  }
  if (typeof value === 'boolean') {
    return (
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
        value ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
      }`}>
        {value ? 'Sim' : 'Não'}
      </span>
    )
  }

  const formatted = autoFormat(fieldKey, value)
  const raw = String(value)
  const changed = formatted !== raw && formatted !== null

  return (
    <span className="text-slate-700 text-sm break-words">
      {changed ? formatted : raw}
    </span>
  )
}

// Renders an array — either of primitives or of objects
function ArrayRenderer({ fieldKey, items }) {
  if (!Array.isArray(items) || items.length === 0) {
    return <span className="text-slate-300 italic text-xs">lista vazia</span>
  }

  const firstIsObject = items.length > 0 && typeof items[0] === 'object' && items[0] !== null

  if (firstIsObject) {
    return (
      <div className="space-y-2 mt-1">
        {items.map((item, idx) => (
          <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
              Item {idx + 1}
            </p>
            <ObjectRenderer obj={item} depth={1} />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {items.map((item, idx) => (
        <span key={idx} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full">
          <PrimitiveValue fieldKey={fieldKey} value={item} />
        </span>
      ))}
    </div>
  )
}

// Recursively renders an object
function ObjectRenderer({ obj, depth = 0 }) {
  if (obj === null || obj === undefined) {
    return <span className="text-slate-300 italic text-xs">nulo</span>
  }

  if (typeof obj !== 'object') {
    return <PrimitiveValue fieldKey="" value={obj} />
  }

  const entries = Object.entries(obj)

  return (
    <dl className={`space-y-3 ${depth > 0 ? '' : ''}`}>
      {entries.map(([key, value]) => {
        const label = friendlyLabel(key)
        const isEmpty = value === null || value === undefined || value === ''
        const isArray = Array.isArray(value)
        const isObject = !isArray && typeof value === 'object' && value !== null

        return (
          <div key={key} className={`${isObject || isArray ? '' : 'flex flex-wrap gap-x-3 items-baseline'}`}>
            <dt className={`text-xs font-semibold uppercase tracking-wide shrink-0 ${
              isEmpty ? 'text-slate-300' : 'text-slate-400'
            }`}>
              {label}
            </dt>

            {isEmpty ? (
              <dd className="text-slate-300 italic text-xs">—</dd>
            ) : isArray ? (
              <dd className="w-full mt-1">
                <ArrayRenderer fieldKey={key} items={value} />
              </dd>
            ) : isObject ? (
              <dd className="w-full mt-1 pl-3 border-l-2 border-slate-100">
                <ObjectRenderer obj={value} depth={depth + 1} />
              </dd>
            ) : (
              <dd>
                <PrimitiveValue fieldKey={key} value={value} />
              </dd>
            )}
          </div>
        )
      })}
    </dl>
  )
}

export { ObjectRenderer }
