"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, ThumbsUp, MessageSquare, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"

interface RecentVideosProps {
  userId: string
}

interface Video {
  id: string
  title: string
  thumbnail_url: string
  views: number
  likes: number
  uploaded_at: string
  visibility: string
}

export default function RecentVideos({ userId }: RecentVideosProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<Record<string, number>>({})
  const supabase = createClient()

  useEffect(() => {
    fetchRecentVideos()
  }, [userId])

  const fetchRecentVideos = async () => {
    try {
      // Fetch recent videos
      const { data: videosData, error: videosError } = await supabase
        .from("video")
        .select("*")
        .eq("channel_id", userId)
        .order("uploaded_at", { ascending: false })
        .limit(5)

      if (videosError) throw videosError

      setVideos(videosData || [])

      // Fetch comment counts for each video
      if (videosData && videosData.length > 0) {
        const videoIds = videosData.map((v) => v.id)
        const { data: commentsData } = await supabase.from("comments").select("video_id").in("video_id", videoIds)

        // Count comments per video
        const commentCounts: Record<string, number> = {}
        commentsData?.forEach((comment) => {
          commentCounts[comment.video_id] = (commentCounts[comment.video_id] || 0) + 1
        })
        setComments(commentCounts)
      }
    } catch (error) {
      console.error("Error fetching recent videos:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString)
      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

      if (diffInSeconds < 60) return "Just now"
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
      return `${Math.floor(diffInSeconds / 2592000)}mo ago`
    } catch {
      return "Recently"
    }
  }

  const formatNumber = (num: number) => {
    if (num < 1000) return num.toString()
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`
    return `${(num / 1000000).toFixed(1)}M`
  }

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return

    try {
      const { error } = await supabase.from("video").delete().eq("id", videoId)

      if (error) throw error

      // Refresh the videos list
      fetchRecentVideos()
    } catch (error) {
      console.error("Error deleting video:", error)
      alert("Failed to delete video")
    }
  }

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Recent Videos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg">
                <div className="skeleton w-20 h-12 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-3/4 rounded"></div>
                  <div className="skeleton h-3 w-1/2 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Recent Videos</CardTitle>
        <Link href="/studio/content">
          <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:text-white">
            View All
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {videos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No videos uploaded yet</p>
            <Link href="/upload">
              <Button className="bg-red-600 hover:bg-red-700">Upload Your First Video</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {videos.map((video) => (
              <div
                key={video.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <img
                  src={video.thumbnail_url || "/placeholder.svg?height=48&width=80"}
                  alt={video.title}
                  className="w-20 h-12 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-medium truncate">{video.title}</h4>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {formatNumber(video.views || 0)}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {formatNumber(video.likes || 0)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {comments[video.id] || 0}
                    </span>
                    <span>{formatTimeAgo(video.uploaded_at)}</span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-800 border-gray-700">
                    <DropdownMenuItem asChild className="text-gray-300 hover:text-white">
                      <Link href={`/watch/${video.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteVideo(video.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
