import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Header from "@/components/header"
import StudioSidebar from "@/components/creator-studio/studio-sidebar"
import DashboardStats from "@/components/creator-studio/dashboard-stats"
import RecentVideos from "@/components/creator-studio/recent-videos"
import AnalyticsChart from "@/components/creator-studio/analytics-chart"
import { Button } from "@/components/ui/button"
import { Upload, Plus } from "lucide-react"
import Link from "next/link"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export default async function CreatorStudioPage() {
  try {
    const supabase = createClient()

    if (!supabase) {
      console.error("Failed to create Supabase client")
      redirect("/auth/login")
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      redirect("/auth/login")
    }

    // Fetch user's channel data
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    // Fetch user's videos for stats
    const { data: videos } = await supabase.from("video").select("*").eq("channel_id", user.id)

    // Calculate stats
    const totalVideos = videos?.length || 0
    const totalViews = videos?.reduce((sum, video) => sum + (video.views || 0), 0) || 0
    const totalLikes = videos?.reduce((sum, video) => sum + (video.likes || 0), 0) || 0
    const subscribers = profile?.subscribers || 0

    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white">
        <Header />

        <div className="flex">
          <StudioSidebar />

          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white">Creator Studio Dashboard</h1>
                  <p className="text-gray-400 mt-1">Manage your channel and track performance</p>
                </div>
                <div className="flex gap-3">
                  <Link href="/upload">
                    <Button className="bg-red-600 hover:bg-red-700">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Video
                    </Button>
                  </Link>
                  <Button variant="outline" className="border-gray-600 text-gray-300 hover:text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <DashboardStats
                totalViews={totalViews}
                subscribers={subscribers}
                totalVideos={totalVideos}
                totalLikes={totalLikes}
              />

              {/* Charts and Recent Videos */}
              <div className="grid gap-6 lg:grid-cols-2">
                <AnalyticsChart userId={user.id} />
                <RecentVideos userId={user.id} />
              </div>

              {/* Quick Actions */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                  <h3 className="text-white font-semibold mb-2">Channel Performance</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {totalVideos > 0
                      ? `You have ${totalVideos} videos with ${totalViews.toLocaleString()} total views.`
                      : "Start uploading videos to track your performance."}
                  </p>
                  <Link href="/studio/analytics">
                    <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:text-white">
                      View Analytics
                    </Button>
                  </Link>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                  <h3 className="text-white font-semibold mb-2">Content Management</h3>
                  <p className="text-gray-400 text-sm mb-4">Organize and manage all your video content in one place.</p>
                  <Link href="/studio/content">
                    <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:text-white">
                      Manage Content
                    </Button>
                  </Link>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
                  <h3 className="text-white font-semibold mb-2">Community</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    Engage with your audience and build stronger connections.
                  </p>
                  <Link href="/studio/comments">
                    <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:text-white">
                      Manage Comments
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in CreatorStudioPage:", error)
    redirect("/auth/login")
  }
}
