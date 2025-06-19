export default function SidebarSkeleton() {
  return (
    <aside className="fixed left-0 top-0 h-full bg-gray-950/95 backdrop-blur-md border-r border-gray-800/50 z-50 w-64 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800/50">
        <div className="skeleton h-6 w-24 rounded"></div>
        <div className="skeleton w-5 h-5 rounded"></div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Main Navigation */}
        <div className="space-y-1">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5">
              <div className="skeleton w-5 h-5 rounded"></div>
              <div className="skeleton h-4 w-20 rounded"></div>
            </div>
          ))}
        </div>

        <div className="skeleton h-px w-full"></div>

        {/* Library */}
        <div className="space-y-3">
          <div className="skeleton h-4 w-16 rounded"></div>
          <div className="space-y-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                <div className="skeleton w-5 h-5 rounded"></div>
                <div className="skeleton h-4 w-24 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="skeleton h-px w-full"></div>

        {/* Categories */}
        <div className="space-y-3">
          <div className="skeleton h-4 w-20 rounded"></div>
          <div className="space-y-1">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                <div className="skeleton w-5 h-5 rounded"></div>
                <div className="skeleton h-4 w-20 rounded"></div>
              </div>
            ))}
          </div>
        </div>

        <div className="skeleton h-px w-full"></div>

        {/* Subscriptions */}
        <div className="space-y-3">
          <div className="skeleton h-4 w-24 rounded"></div>
          <div className="space-y-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2">
                <div className="skeleton w-6 h-6 rounded-full"></div>
                <div className="skeleton h-4 w-20 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800/50">
        <div className="space-y-1">
          <div className="skeleton h-3 w-20 rounded"></div>
          <div className="skeleton h-3 w-32 rounded"></div>
        </div>
      </div>
    </aside>
  )
}
