export default function LoadingState({ count = 6, type = 'card' }) {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-cardBorder overflow-hidden shadow-sm">
            <div className="animate-shimmer h-44 w-full" />
            <div className="p-4 space-y-3">
              <div className="animate-shimmer h-5 w-3/4 rounded-xl" />
              <div className="animate-shimmer h-3 w-1/2 rounded-xl" />
              <div className="animate-shimmer h-3 w-2/3 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (type === 'list') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-cardBorder overflow-hidden shadow-sm">
            <div className="p-4 space-y-3">
              <div className="animate-shimmer h-28 w-full rounded-2xl" />
              <div className="animate-shimmer h-5 w-2/3 rounded-xl" />
              <div className="animate-shimmer h-3 w-1/3 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Yükleniyor...
      </div>
    </div>
  )
}
