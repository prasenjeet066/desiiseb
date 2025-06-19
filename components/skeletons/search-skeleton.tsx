export default function SearchSkeleton() {
  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="skeleton h-8 w-64 rounded"></div>
          <div className="skeleton h-4 w-32 rounded"></div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="skeleton h-10 w-40 rounded-full"></div>
          <div className="skeleton h-10 w-40 rounded-full"></div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="skeleton aspect-video rounded-xl"></div>
            <div className="flex gap-3">
              <div className="skeleton w-9 h-9 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-full rounded"></div>
                <div className="skeleton h-3 w-3/4 rounded"></div>
                <div className="skeleton h-3 w-1/2 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
