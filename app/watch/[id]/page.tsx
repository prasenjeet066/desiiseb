import { createClient } from "@/utils/supabase/server"
import { notFound } from "next/navigation"
import VideoWatchPage from "@/components/video-watch-page"
import PageWithSidebar from "@/components/page-with-sidebar"
import PublicHeader from "@/components/public-header"

// Force dynamic rendering
export const dynamic = "force-dynamic"

interface WatchPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function WatchPage({ params }: WatchPageProps) {
  try {
    const supabase = createClient()
    const { id } = await params

    if (!supabase) {
      console.error("Failed to create Supabase client")
      notFound()
    }

    const { data: video, error } = await supabase.from("video").select("*").eq("id", id).single()

    if (error) {
      console.error("Database error:", error)
      notFound()
    }

    if (!video) {
      notFound()
    }

    // Check if user is authenticated
    let user = null
    try {
      const { data } = await supabase.auth.getUser()
      user = data?.user || null
    } catch (error) {
      console.log("No authenticated user")
    }

    // Increment view count
    await supabase
      .from("video")
      .update({ views: (video.views || 0) + 1 })
      .eq("id", id)

    // Show different layout based on authentication status
    if (user) {
      return (
        <PageWithSidebar>
          <VideoWatchPage video={video} />
        </PageWithSidebar>
      )
    }

    // Public view for unauthenticated users
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white">
        <PublicHeader />
        <VideoWatchPage video={video} />
      </div>
    )
  } catch (error) {
    console.error("Error fetching video:", error)
    notFound()
  }
}
