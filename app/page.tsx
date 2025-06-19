import { createClient } from "@/utils/supabase/server"
import VideoFeed from "@/components/video-feed"
import PageWithSidebar from "@/components/page-with-sidebar"
import PublicHeader from "@/components/public-header"
import { Suspense } from "react"
import VideoFeedSkeleton from "@/components/skeletons/video-feed-skeleton"
import VideoSlider from "@/components/video-slider"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export default async function HomePage() {
  try {
    const supabase = createClient()
    let user = null

    if (supabase) {
      try {
        const { data } = await supabase.auth.getUser()
        user = data?.user || null
      } catch (error) {
        console.log("No authenticated user")
      }
    }

    // Show different layout based on authentication status
    if (user) {
      return (
        <PageWithSidebar>
          <div className="container mx-auto px-4 py-8">
            <div className="mb-8 animate-fade-in">
              <h1 className="text-3xl font-bold gradient-text mb-2">Discover</h1>
              <p className="text-gray-400 text-lg">Watch the latest videos from creators around the world</p>
            </div>

            {/* Add Video Slider */}
            <div className="mb-12">
              <VideoSlider />
            </div>

            <Suspense fallback={<VideoFeedSkeleton />}>
              <VideoFeed />
            </Suspense>
          </div>
        </PageWithSidebar>
      )
    }

    // Public view for unauthenticated users
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white">
        <PublicHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold gradient-text mb-2">Discover</h1>
            <p className="text-gray-400 text-lg">Watch the latest videos from creators around the world</p>
          </div>

          {/* Add Video Slider */}
          <div className="mb-12">
            <VideoSlider />
          </div>

          <Suspense fallback={<VideoFeedSkeleton />}>
            <VideoFeed />
          </Suspense>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in HomePage:", error)
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white">
        <PublicHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold gradient-text mb-2">Discover</h1>
            <p className="text-gray-400 text-lg">Watch the latest videos from creators around the world</p>
          </div>

          {/* Add Video Slider */}
          <div className="mb-12">
            <VideoSlider />
          </div>

          <Suspense fallback={<VideoFeedSkeleton />}>
            <VideoFeed />
          </Suspense>
        </div>
      </div>
    )
  }
}
