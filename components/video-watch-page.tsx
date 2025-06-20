"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LoadingSpinner, CardLoadingSpinner } from "@/components/ui/loading-spinner"
import {
  ThumbsUp,
  ThumbsDown,
  Share,
  Download,
  MoreHorizontal,
  Bell,
  Eye,
  Calendar,
  AlertCircle,
  RefreshCw,
  Play,
} from "lucide-react"
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
  user_id: string
  profiles: {
    username: string
    full_name: string
    avatar_url: string | null
    bio: string | null
  }
}

interface RelatedVideo {
  id: string
  title: string
  thumbnail_url: string | null
  views: number
  uploaded_at: string
  profiles: {
    full_name: string
    avatar_url: string | null
  }
}

interface VideoWatchPageProps {
  videoId: string
}

export default function VideoWatchPage({ videoId }: VideoWatchPageProps) {
  const [video, setVideo] = useState<Video | null>(null)
  const [relatedVideos, setRelatedVideos] = useState<RelatedVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [relatedLoading, setRelatedLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liked, setLiked] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    if (videoId) {
      fetchVideo()
      fetchRelatedVideos()
    }
  }, [videoId])

  const fetchVideo = async () => {
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
            avatar_url,
            bio
          )
        `)
        .eq("id", videoId)
        .single()

      if (error) throw error

      setVideo(data)

      // Increment view count
      await supabase
        .from("video")
        .update({ views: (data.views || 0) + 1 })
        .eq("id", videoId)
    } catch (err) {
      console.error("Error fetching video:", err)
      setError("Failed to load video. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedVideos = async () => {
    try {
      setRelatedLoading(true)

      const { data, error } = await supabase
        .from("video")
        .select(`
          id,
          title,
          thumbnail_url,
          views,
          uploaded_at,
          profiles!video_channel_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq("is_public", true)
        .neq("id", videoId)
        .order("uploaded_at", { ascending: false })
        .limit(10)

      if (error) throw error

      setRelatedVideos(data || [])
    } catch (err) {
      console.error("Error fetching related videos:", err)
    } finally {
      setRelatedLoading(false)
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
    return <LoadingSpinner size="xl" className="min-h-screen" />
  }

  if (error || !video) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h3 className="text-lg font-semibold text-red-600">Error Loading Video</h3>
            <p className="text-gray-600">{error || "Video not found"}</p>
            <Button onClick={fetchVideo} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-6">
        {/* Video Player */}
        <div className="aspect-video rounded-xl overflow-hidden bg-gray-900 mb-6">
          <video
            src={video.video_url}
            poster={video.thumbnail_url || undefined}
            controls
            className="w-full h-full"
            autoPlay
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Side - Video Info */}
          <div className="lg:col-span-8 space-y-4">
            {/* Video Title */}
            <div className="space-y-2">
              <h1 className="text-xl md:text-2xl font-bold">{video.title}</h1>
              {video.category && <Badge variant="secondary">{video.category}</Badge>}
            </div>

            {/* Stats and Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{formatNumber(video.views)} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDistanceToNow(new Date(video.uploaded_at), { addSuffix: true })}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant={liked ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLiked(!liked)}
                  className="bg-black text-white border-gray-600"
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  {formatNumber(video.likes + (liked ? 1 : 0))}
                </Button>
                <Button variant="outline" size="sm" className="bg-black text-white border-gray-600">
                  <ThumbsDown className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="bg-black text-white border-gray-600">
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm" className="bg-black text-white border-gray-600">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" size="icon" className="bg-black text-white border-gray-600">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Channel Info */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={video.profiles?.avatar_url || undefined} />
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500">
                    {getInitials(video.profiles?.full_name || "User")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Link href={`/profile/${video.profiles?.username}`}>
                    <h3 className="font-semibold hover:text-blue-400 transition-colors">{video.profiles?.full_name}</h3>
                  </Link>
                  <p className="text-sm text-gray-400">0 subscribers</p>
                </div>
              </div>
              <Button
                variant={subscribed ? "outline" : "default"}
                onClick={() => setSubscribed(!subscribed)}
                className={subscribed ? "bg-black text-white border-gray-600" : ""}
              >
                <Bell className="w-4 h-4 mr-2" />
                {subscribed ? "Subscribed" : "Subscribe"}
              </Button>
            </div>

            {/* Description */}
            {video.description && (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4">
                  <p className="text-gray-300 whitespace-pre-wrap">{video.description}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Side - Related Videos */}
          <div className="lg:col-span-4 space-y-4">
            <h2 className="text-lg font-semibold">Related Videos</h2>

            {relatedLoading ? (
              <CardLoadingSpinner />
            ) : relatedVideos.length === 0 ? (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-6 text-center space-y-4">
                  <Play className="w-12 h-12 text-gray-500 mx-auto" />
                  <p className="text-gray-400">No related videos found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {relatedVideos.map((relatedVideo) => (
                  <Card
                    key={relatedVideo.id}
                    className="group hover:shadow-lg transition-all duration-200 bg-gray-900 border-gray-800"
                  >
                    <Link href={`/watch/${relatedVideo.id}`}>
                      <div className="flex gap-3 p-3">
                        <div className="w-40 aspect-video flex-shrink-0">
                          <img
                            src={relatedVideo.thumbnail_url || "/placeholder.svg?height=90&width=160"}
                            alt={relatedVideo.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <h3 className="font-medium line-clamp-2 text-sm group-hover:text-blue-400 transition-colors">
                            {relatedVideo.title}
                          </h3>
                          <p className="text-xs text-gray-400">{relatedVideo.profiles?.full_name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{formatNumber(relatedVideo.views)} views</span>
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(relatedVideo.uploaded_at), { addSuffix: true })}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
