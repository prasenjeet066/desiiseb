export default function VideoWatchSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 animate-fade-in">
      {/* Video Player Skeleton */}
      <div className="aspect-video rounded-xl overflow-hidden bg-gray-800 mb-6 skeleton"></div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side - Video Info and Comments */}
        <div className="lg:col-span-8 space-y-4">
          {/* Video Title */}
          <div className="space-y-3">
            <div className="skeleton h-8 w-full rounded"></div>
            <div className="skeleton h-6 w-3/4 rounded"></div>
          </div>

          {/* Stats and Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="skeleton h-4 w-20 rounded"></div>
              <div className="skeleton h-4 w-24 rounded"></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="skeleton h-10 w-24 rounded-full"></div>
              <div className="skeleton h-10 w-20 rounded-full"></div>
              <div className="skeleton h-10 w-24 rounded-full"></div>
              <div className="skeleton h-10 w-10 rounded-full"></div>
            </div>
          </div>

          {/* Channel Info */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="skeleton w-12 h-12 rounded-full"></div>
              <div className="space-y-2">
                <div className="skeleton h-5 w-32 rounded"></div>
                <div className="skeleton h-4 w-24 rounded"></div>
              </div>
            </div>
            <div className="skeleton h-10 w-28 rounded-full"></div>
          </div>

          {/* Description */}
          <div className="bg-gray-900 rounded-lg p-4 space-y-3">
            <div className="skeleton h-4 w-full rounded"></div>
            <div className="skeleton h-4 w-5/6 rounded"></div>
            <div className="skeleton h-4 w-4/6 rounded"></div>
          </div>

          {/* Comments Section */}
          <div className="space-y-4">
            <div className="skeleton h-6 w-40 rounded"></div>

            {/* Add Comment */}
            <div className="flex gap-3">
              <div className="skeleton w-8 h-8 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="skeleton h-20 w-full rounded"></div>
                <div className="flex justify-end gap-2">
                  <div className="skeleton h-8 w-16 rounded-full"></div>
                  <div className="skeleton h-8 w-20 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <div className="skeleton w-8 h-8 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="skeleton h-4 w-24 rounded"></div>
                      <div className="skeleton h-3 w-16 rounded"></div>
                    </div>
                    <div className="skeleton h-4 w-full rounded"></div>
                    <div className="skeleton h-4 w-4/5 rounded"></div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="skeleton h-6 w-12 rounded"></div>
                      <div className="skeleton h-6 w-8 rounded"></div>
                      <div className="skeleton h-6 w-12 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Recommended Videos */}
        <div className="lg:col-span-4 space-y-4">
          <div className="skeleton h-6 w-32 rounded"></div>

          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="skeleton w-40 h-24 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-full rounded"></div>
                  <div className="skeleton h-3 w-3/4 rounded"></div>
                  <div className="skeleton h-3 w-1/2 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
