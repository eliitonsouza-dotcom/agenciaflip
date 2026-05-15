function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-200 rounded-lg ${className}`} />
}

export default function LoadingSkeleton() {
  return (
    <div className="space-y-6 mt-6">
      {/* Summary card skeleton */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
        <div className="bg-blue-100 px-6 py-5">
          <Skeleton className="h-4 w-32 mb-3 bg-blue-200" />
          <Skeleton className="h-7 w-64 mb-2 bg-blue-200" />
          <Skeleton className="h-4 w-48 bg-blue-200" />
        </div>
        <div className="p-6 space-y-6">
          {[1, 2, 3].map(s => (
            <div key={s}>
              <Skeleton className="h-3 w-24 mb-3" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i}>
                    <Skeleton className="h-3 w-20 mb-1.5" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats bar skeleton */}
      <div className="bg-white border border-slate-100 rounded-xl px-4 py-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>

      {/* Full data skeleton */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-6 space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-3 items-baseline">
            <Skeleton className="h-3 w-24 shrink-0" />
            <Skeleton className={`h-4 ${i % 3 === 0 ? 'w-48' : i % 2 === 0 ? 'w-36' : 'w-28'}`} />
          </div>
        ))}
      </div>
    </div>
  )
}
