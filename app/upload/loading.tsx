import UploadSkeleton from "@/components/skeletons/upload-skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="skeleton w-12 h-12 rounded-full"></div>
            <div className="space-y-2">
              <div className="skeleton h-8 w-48 rounded"></div>
              <div className="skeleton h-4 w-32 rounded"></div>
            </div>
          </div>
        </div>

        <UploadSkeleton />
      </div>
    </div>
  )
}
