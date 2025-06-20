"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CardLoadingSpinner } from "@/components/ui/loading-spinner"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw, Play, Eye, Clock } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface Video {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  video_url: string
  views: number
  likes: number
  uploaded_at: string
  category: string | null
  channel_id: string
  profiles: {
    username: string
    full_name: string
    avatar_url: string | null
  }
}

export default function VideoFeed() {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from("video")
        .select(`
          *,
          profiles!video_channel_id_fkey (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq("is_public", true)
        .order("uploaded_at", { ascending: false })
        .limit(20)

      if (error) throw error

      setVideos(data || [])
    } catch (err) {
      console.error("Error fetching videos:", err)
      setError("Failed to load videos. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (loading) {
    return <CardLoadingSpinner />
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h3 className="text-lg font-semibold text-red-600">Error Loading Videos</h3>
          <p className="text-gray-400">{error}</p>
          <Button onClick={fetchVideos}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (videos.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center space-y-4">
          <Play className="w-16 h-16 text-gray-500 mx-auto" />
          <h3 className="text-xl font-semibold">No videos available</h3>
          <p className="text-gray-400">Be the first to upload a video!</p>
          <Button asChild>
            <Link href="/upload">
              <Play className="w-4 h-4 mr-2" />
              Upload Video
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {videos.map((video) => (
        <Card
          key={video.id}
          className="group hover:shadow-lg transition-all duration-200 bg-gray-900/50 border-gray-800/50"
        >
          <Link href={`/watch/${video.id}`}>
            <div className="space-y-3">
              {/* Thumbnail */}
              <div className="aspect-video relative overflow-hidden rounded-t-lg">
                <img
                  src={video.thumbnail_url || "/placeholder.svg?height=180&width=320"}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                  <Clock className="w-3 h-3 inline mr-1" />
                  5:24
                </div>
              </div>

              {/* Content */}
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Avatar className="w-9 h-9 flex-shrink-0">
                    <AvatarImage src={video.profiles?.avatar_url || undefined} />
                    <AvatarFallback className="text-xs bg-gradient-to-r from-blue-500 to-purple-500">
                      {getInitials(video.profiles?.full_name || "User")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-semibold line-clamp-2 group-hover:text-blue-400 transition-colors text-sm">
                      {video.title}
                    </h3>
                    <p className="text-xs text-gray-400">{video.profiles?.full_name || "Unknown User"}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{formatNumber(video.views)} views</span>
                      </div>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(video.uploaded_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>

                {/* Category Badge */}
                {video.category && (
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {video.category}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </div>
          </Link>
        </Card>
      ))}
    </div>
  )
}
