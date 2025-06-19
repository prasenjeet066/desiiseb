export default function UploadSkeleton() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center">
              <div className="skeleton w-10 h-10 rounded-full"></div>
              <div className="skeleton ml-3 h-4 w-16 rounded"></div>
              {i < 3 && <div className="skeleton w-8 h-1 mx-4 rounded"></div>}
            </div>
          ))}
        </div>
        <div className="skeleton h-2 w-full rounded"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video Upload Section */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 space-y-6">
            <div className="space-y-3">
              <div className="skeleton h-6 w-32 rounded"></div>
              <div className="skeleton h-4 w-64 rounded"></div>
            </div>

            <div className="space-y-4">
              <div className="skeleton h-12 w-full rounded"></div>
              <div className="skeleton h-10 w-full rounded"></div>
            </div>
          </div>

          {/* Details Section */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 space-y-6">
            <div className="space-y-3">
              <div className="skeleton h-6 w-24 rounded"></div>
              <div className="skeleton h-4 w-48 rounded"></div>
            </div>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="skeleton h-4 w-20 rounded"></div>
                <div className="skeleton h-16 w-full rounded"></div>
              </div>

              <div className="space-y-3">
                <div className="skeleton h-4 w-24 rounded"></div>
                <div className="skeleton h-32 w-full rounded"></div>
              </div>

              <div className="space-y-3">
                <div className="skeleton h-4 w-20 rounded"></div>
                <div className="skeleton h-12 w-full rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Preview */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6">
            <div className="skeleton h-6 w-20 rounded mb-4"></div>
            <div className="skeleton aspect-video rounded-lg mb-4"></div>
            <div className="space-y-2">
              <div className="skeleton h-4 w-full rounded"></div>
              <div className="skeleton h-3 w-3/4 rounded"></div>
            </div>
          </div>

          {/* Visibility */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-6 space-y-4">
            <div className="skeleton h-6 w-24 rounded"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 border border-gray-700 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="skeleton w-5 h-5 rounded"></div>
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-20 rounded"></div>
                    <div className="skeleton h-3 w-full rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="skeleton h-12 w-full rounded-full"></div>
            <div className="skeleton h-10 w-full rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
