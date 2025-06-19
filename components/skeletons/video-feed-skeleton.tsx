export default function VideoFeedSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(12)].map((_, i) => (
        <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
          <div className="bg-gray-900/50 rounded-xl overflow-hidden border border-gray-800/50">
            {/* Thumbnail */}
            <div className="skeleton aspect-video rounded-t-xl"></div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className="skeleton w-9 h-9 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-full rounded"></div>
                  <div className="skeleton h-4 w-3/4 rounded"></div>
                  <div className="skeleton h-3 w-1/2 rounded"></div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-2">
                <div className="skeleton h-6 w-16 rounded-full"></div>
                <div className="skeleton h-6 w-20 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
