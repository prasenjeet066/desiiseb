"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Eye, Users, Clock, ThumbsUp, Download, Calendar } from "lucide-react"

interface StudioAnalyticsProps {
  userId: string
}

interface AnalyticsData {
  totalViews: number
  totalWatchTime: number
  subscribers: number
  engagement: number
  topVideos: Array<{
    id: string
    title: string
    views: number
    thumbnail_url: string
  }>
  recentPerformance: {
    today: number
    yesterday: number
    last7Days: number
    last30Days: number
  }
}

export default function StudioAnalytics({ userId }: StudioAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchAnalyticsData()
  }, [userId])

  const fetchAnalyticsData = async () => {
    try {
      // Fetch user profile for subscriber count
      const { data: profile } = await supabase.from("profiles").select("subscribers").eq("id", userId).single()

      // Fetch all user videos
      const { data: videos } = await supabase.from("video").select("*").eq("channel_id", userId)

      if (!videos) {
        setAnalytics({
          totalViews: 0,
          totalWatchTime: 0,
          subscribers: profile?.subscribers || 0,
          engagement: 0,
          topVideos: [],
          recentPerformance: {
            today: 0,
            yesterday: 0,
            last7Days: 0,
            last30Days: 0,
          },
        })
        return
      }

      // Calculate total views and engagement
      const totalViews = videos.reduce((sum, video) => sum + (video.views || 0), 0)
      const totalLikes = videos.reduce((sum, video) => sum + (video.likes || 0), 0)
      const totalDislikes = videos.reduce((sum, video) => sum + (video.dislikes || 0), 0)
      const engagement = totalViews > 0 ? ((totalLikes + totalDislikes) / totalViews) * 100 : 0

      // Get top performing videos
      const topVideos = videos
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 3)
        .map((video) => ({
          id: video.id,
          title: video.title,
          views: video.views || 0,
          thumbnail_url: video.thumbnail_url,
        }))

      // Calculate recent performance (simplified - in real app you'd track daily views)
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
      const last7Days = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const last30Days = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

      const recentVideos = videos.filter((video) => new Date(video.uploaded_at) >= last30Days)
      const last7DaysVideos = videos.filter((video) => new Date(video.uploaded_at) >= last7Days)

      setAnalytics({
        totalViews,
        totalWatchTime: Math.floor(totalViews * 0.6), // Estimated watch time
        subscribers: profile?.subscribers || 0,
        engagement: Math.round(engagement * 100) / 100,
        topVideos,
        recentPerformance: {
          today: Math.floor(totalViews * 0.02), // Estimated daily views
          yesterday: Math.floor(totalViews * 0.018),
          last7Days: last7DaysVideos.reduce((sum, video) => sum + (video.views || 0), 0),
          last30Days: recentVideos.reduce((sum, video) => sum + (video.views || 0), 0),
        },
      })
    } catch (error) {
      console.error("Error fetching analytics data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num < 1000) return num.toString()
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`
    return `${(num / 1000000).toFixed(1)}M`
  }

  if (loading) {
    return (
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="skeleton h-8 w-64 rounded"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (!analytics) {
    return (
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-400">Failed to load analytics data</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Analytics</h1>
            <p className="text-gray-400 mt-1">Track your channel performance and audience insights</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:text-white">
              <Calendar className="w-4 h-4 mr-2" />
              Last 28 days
            </Button>
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:text-white">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Views</CardTitle>
              <Eye className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatNumber(analytics.totalViews)}</div>
              <div className="text-xs flex items-center gap-1 text-green-400">
                <TrendingUp className="w-3 h-3" />
                Channel lifetime views
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Watch Time</CardTitle>
              <Clock className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatNumber(analytics.totalWatchTime)} hrs</div>
              <div className="text-xs flex items-center gap-1 text-green-400">
                <TrendingUp className="w-3 h-3" />
                Estimated total watch time
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Subscribers</CardTitle>
              <Users className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatNumber(analytics.subscribers)}</div>
              <div className="text-xs flex items-center gap-1 text-gray-400">
                <Users className="w-3 h-3" />
                Total subscribers
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Engagement</CardTitle>
              <ThumbsUp className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analytics.engagement}%</div>
              <div className="text-xs flex items-center gap-1 text-gray-400">
                <ThumbsUp className="w-3 h-3" />
                Likes + dislikes / views
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Placeholder */}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Views & Watch Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center border-2 border-dashed border-gray-700 rounded-lg">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Chart visualization coming soon</p>
                  <p className="text-gray-500 text-sm">Views and watch time analytics</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Audience Demographics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center border-2 border-dashed border-gray-700 rounded-lg">
                <div className="text-center">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Demographics chart coming soon</p>
                  <p className="text-gray-500 text-sm">Age and location breakdown</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Videos */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Top Performing Videos</CardTitle>
          </CardHeader>
          <CardContent>
            {analytics.topVideos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No videos uploaded yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {analytics.topVideos.map((video, index) => (
                  <div
                    key={video.id}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <img
                      src={video.thumbnail_url || "/placeholder.svg?height=60&width=100"}
                      alt={video.title}
                      className="w-16 h-10 rounded object-cover"
                    />
                    <div className="flex-1">
                      <h4 className="text-white font-medium line-clamp-1">{video.title}</h4>
                      <p className="text-gray-400 text-sm">{formatNumber(video.views)} views</p>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">#{index + 1}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Recent Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Today</span>
                  <span className="text-white font-semibold">
                    {formatNumber(analytics.recentPerformance.today)} views
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Yesterday</span>
                  <span className="text-white font-semibold">
                    {formatNumber(analytics.recentPerformance.yesterday)} views
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Last 7 days</span>
                  <span className="text-white font-semibold">
                    {formatNumber(analytics.recentPerformance.last7Days)} views
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Last 30 days</span>
                  <span className="text-white font-semibold">
                    {formatNumber(analytics.recentPerformance.last30Days)} views
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Channel Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total subscribers</span>
                  <span className="text-white font-semibold">{formatNumber(analytics.subscribers)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total views</span>
                  <span className="text-white font-semibold">{formatNumber(analytics.totalViews)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Engagement rate</span>
                  <span className="text-white font-semibold">{analytics.engagement}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Est. watch time</span>
                  <span className="text-white font-semibold">{formatNumber(analytics.totalWatchTime)} hrs</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
