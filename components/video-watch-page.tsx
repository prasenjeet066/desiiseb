"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import VideoPlayer from "./video-player"
import { Heart, Share2, Download, ThumbsDown, Bell, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface VideoWatchPageProps {
  video: {
    id: string
    title: string
    description: string
    video_url: string
    thumbnail_url: string
    uploaded_at: string
    channel_id: string
    channel_name: string
    channel_avatar: string
    views: number
    likes: number
    dislikes: number
    liked_by: string[]
    disliked_by: string[]
    category?: string
    tags?: string[]
  }
}

export default function VideoWatchPage({ video }: VideoWatchPageProps) {
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [relatedVideos, setRelatedVideos] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    getCurrentUser()
    fetchRelatedVideos()
  }, [])

  useEffect(() => {
    if (currentUser) {
      setLiked(video.liked_by?.includes(currentUser.id) || false)
      setDisliked(video.disliked_by?.includes(currentUser.id) || false)
    }
  }, [currentUser, video])

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const fetchRelatedVideos = async () => {
    try {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("visibility", "public")
        .neq("id", video.id)
        .limit(10)
        .order("views", { ascending: false })

      if (error) throw error
      setRelatedVideos(data || [])
    } catch (error) {
      console.error("Error fetching related videos:", error)
    }
  }

  const handleLike = async () => {
    if (!currentUser) return

    try {
      const newLikedBy = liked
        ? video.liked_by?.filter((id) => id !== currentUser.id) || []
        : [...(video.liked_by || []), currentUser.id]

      const newDislikedBy = video.disliked_by?.filter((id) => id !== currentUser.id) || []

      await supabase
        .from("videos")
        .update({
          liked_by: newLikedBy,
          disliked_by: newDislikedBy,
          likes: newLikedBy.length,
          dislikes: newDislikedBy.length,
        })
        .eq("id", video.id)

      setLiked(!liked)
      setDisliked(false)
    } catch (error) {
      console.error("Error handling like:", error)
    }
  }

  const handleDislike = async () => {
    if (!currentUser) return

    try {
      const newDislikedBy = disliked
        ? video.disliked_by?.filter((id) => id !== currentUser.id) || []
        : [...(video.disliked_by || []), currentUser.id]

      const newLikedBy = video.liked_by?.filter((id) => id !== currentUser.id) || []

      await supabase
        .from("videos")
        .update({
          liked_by: newLikedBy,
          disliked_by: newDislikedBy,
          likes: newLikedBy.length,
          dislikes: newDislikedBy.length,
        })
        .eq("id", video.id)

      setDisliked(!disliked)
      setLiked(false)
    } catch (error) {
      console.error("Error handling dislike:", error)
    }
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/watch/${video.id}`
    if (navigator.share) {
      await navigator.share({
        title: video.title,
        text: video.description,
        url: shareUrl,
      })
    } else {
      navigator.clipboard.writeText(shareUrl)
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`
  }

  const formatViews = (views: number) => {
    if (views < 1000) return views.toString()
    if (views < 1000000) return `${(views / 1000).toFixed(1)}K`
    return `${(views / 1000000).toFixed(1)}M`
  }

  return (
    <div className="grid grid-cols-1 p-2 xl:grid-cols-12 gap-6">
      {/* Main Video Section */}
      <div className="xl:col-span-8 space-y-6">
        {/* Video Player */}
        <div className="aspect-video bg-black rounded-2xl overflow-hidden">
          <VideoPlayer
            src={video.video_url}
            poster={video.thumbnail_url}
            title={video.title}
            className="w-full h-full"
          />
        </div>

        {/* Video Info */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-2">{video.title}</h1>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={video.channel_avatar || "/placeholder.svg"}
                  alt={video.channel_name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h3 className="font-semibold text-white">{video.channel_name}</h3>
                  <p className="text-gray-400 text-sm">
                    {formatViews(video.views)} views • {formatTimeAgo(video.uploaded_at)}
                  </p>
                </div>
                <Button
                  variant={subscribed ? "secondary" : "default"}
                  onClick={() => setSubscribed(!subscribed)}
                  className="ml-4"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  {subscribed ? "Subscribed" : "Subscribe"}
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={handleLike}
                  className={`${liked ? "bg-red-600 hover:bg-red-700" : ""}`}
                >
                  <Heart className={`w-4 h-4 mr-2 ${liked ? "fill-current" : ""}`} />
                  {video.likes}
                </Button>

                <Button variant="secondary" onClick={handleDislike}>
                  <ThumbsDown className={`w-4 h-4 ${disliked ? "fill-current" : ""}`} />
                </Button>

                <Button variant="secondary" onClick={handleShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>

                <Button variant="secondary">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-900 border-gray-700">
                    <DropdownMenuItem className="text-white hover:bg-gray-800">Save to playlist</DropdownMenuItem>
                    <DropdownMenuItem className="text-white hover:bg-gray-800">Report</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-gray-900/50 rounded-xl p-4">
            <p className="text-gray-300 whitespace-pre-wrap">{video.description}</p>
            {video.category && (
              <div className="mt-4">
                <Badge variant="secondary" className="bg-gray-800 text-gray-300">
                  {video.category}
                </Badge>
              </div>
            )}
            {video.tags && video.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {video.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="border-gray-600 text-gray-400">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar - Related Videos */}
      <div className="xl:col-span-4">
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Related Videos</h3>
          <div className="space-y-4">
            {relatedVideos.map((relatedVideo) => (
              <div
                key={relatedVideo.id}
                className="flex gap-3 p-3 rounded-xl hover:bg-gray-900/50 transition-colors cursor-pointer"
              >
                <div className="w-40 h-24 flex-shrink-0">
                  <img
                    src={relatedVideo.thumbnail_url || "/placeholder.svg"}
                    alt={relatedVideo.title}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white text-sm line-clamp-2 mb-1">{relatedVideo.title}</h4>
                  <p className="text-gray-400 text-xs mb-1">{relatedVideo.channel_name}</p>
                  <p className="text-gray-500 text-xs">
                    {formatViews(relatedVideo.views)} views • {formatTimeAgo(relatedVideo.uploaded_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
