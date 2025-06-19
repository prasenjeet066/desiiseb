export default function ProfileSkeleton() {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Profile Header */}
      <div className="relative">
        {/* Cover Image */}
        <div className="skeleton h-48 md:h-64 rounded-lg"></div>

        {/* Profile Info */}
        <div className="relative -mt-16 px-6">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            <div className="skeleton w-24 h-24 md:w-32 md:h-32 rounded-full"></div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-3">
                  <div className="skeleton h-8 w-64 rounded"></div>
                  <div className="skeleton h-5 w-32 rounded"></div>
                  <div className="skeleton h-4 w-96 rounded"></div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="skeleton h-10 w-24 rounded-full"></div>
                  <div className="skeleton h-10 w-10 rounded-full"></div>
                  <div className="skeleton h-10 w-10 rounded-full"></div>
                  <div className="skeleton h-10 w-10 rounded-full"></div>
                </div>
              </div>

              {/* Profile Stats */}
              <div className="flex flex-wrap gap-6 mt-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="skeleton w-4 h-4 rounded"></div>
                    <div className="skeleton h-4 w-16 rounded"></div>
                  </div>
                ))}
              </div>

              {/* Additional Info */}
              <div className="flex flex-wrap gap-4 mt-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-1">
                    <div className="skeleton w-4 h-4 rounded"></div>
                    <div className="skeleton h-3 w-20 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-10 w-24 rounded-full"></div>
            ))}
          </div>
          <div className="skeleton h-10 w-20 rounded-lg"></div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="skeleton aspect-video rounded-xl"></div>
              <div className="space-y-2">
                <div className="skeleton h-4 w-full rounded"></div>
                <div className="skeleton h-3 w-3/4 rounded"></div>
                <div className="skeleton h-3 w-1/2 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
