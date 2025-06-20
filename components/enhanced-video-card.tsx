"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import VideoPlayer from "./video-player"
import { Heart, MessageCircle, Download, Share2, Send, ThumbsDown, MoreVertical, Bookmark, Flag } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface EnhancedVideoCardProps {
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
    duration?: string
    category?: string
    tags?: string[]
  }
  onUpdate: () => void
  layout?: "grid" | "list"
  showPlayer?: boolean
}

export default function EnhancedVideoCard({
  video,
  onUpdate,
  layout = "grid",
  showPlayer = false,
}: EnhancedVideoCardProps) {
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [watchTime, setWatchTime] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    getCurrentUser()
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

  const handleLike = async () => {
    if (!currentUser) {
      alert("Demo mode - configure Supabase for full functionality")
      return
    }

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
      onUpdate()
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
      onUpdate()
    } catch (error) {
      console.error("Error handling dislike:", error)
    }
  }

  const handleComment = async () => {
    if (!newComment.trim() || !currentUser) return

    try {
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", currentUser.id).single()

      await supabase.from("comments").insert({
        video_id: video.id,
        user_id: currentUser.id,
        user_name: profile?.display_name || profile?.channel_name || "Unknown User",
        user_avatar: profile?.avatar_url || "",
        content: newComment,
        likes: 0,
        liked_by: [],
      })

      setNewComment("")
      fetchComments()
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  const fetchComments = async () => {
    try {
      const { data } = await supabase
        .from("comments")
        .select("*")
        .eq("video_id", video.id)
        .order("created_at", { ascending: false })

      setComments(data || [])
    } catch (error) {
      console.error("Error fetching comments:", error)
    }
  }

  const handleTimeUpdate = (currentTime: number, duration: number) => {
    setWatchTime(currentTime)
    if (currentUser && currentTime > 0) {
      // You could implement watch history tracking here
    }
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/video/${video.id}`

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

  if (layout === "list") {
    return (
      <div className="bg-card rounded-2xl overflow-hidden flex gap-4 p-4 hover:bg-accent/50 transition-all duration-300 border border-border">
        <div className="w-48 h-28 flex-shrink-0">
          {showPlayer ? (
            <VideoPlayer
              src={video.video_url}
              poster={video.thumbnail_url}
              title={video.title}
              onTimeUpdate={handleTimeUpdate}
              className="w-full h-full rounded-xl"
            />
          ) : (
            <div className="relative w-full h-full bg-muted rounded-xl overflow-hidden">
              <img
                src={video.thumbnail_url || "/placeholder.svg"}
                alt={video.title}
                className="w-full h-full object-cover"
              />
              {video.duration && (
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded-lg font-medium backdrop-blur-sm">
                  {video.duration}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex gap-3">
            <img
              src={video.channel_avatar || "/placeholder.svg?height=32&width=32"}
              alt={video.channel_name}
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-base leading-tight line-clamp-2 mb-1">{video.title}</h3>
              <p className="text-muted-foreground text-sm font-medium mb-1">{video.channel_name}</p>
              <div className="flex items-center text-muted-foreground text-sm">
                <span>{formatViews(video.views)} views</span>
                <span className="mx-1">•</span>
                <span>{formatTimeAgo(video.uploaded_at)}</span>
              </div>
            </div>
          </div>

          <p className="text-muted-foreground text-sm line-clamp-2">{video.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className="text-muted-foreground hover:text-foreground"
              >
                <Heart className={`w-4 h-4 mr-1 ${liked ? "fill-red-500 text-red-500" : ""}`} />
                {video.likes}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDislike}
                className="text-muted-foreground hover:text-foreground"
              >
                <ThumbsDown className={`w-4 h-4 mr-1 ${disliked ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-muted-foreground hover:text-foreground"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-background border-border">
                <DropdownMenuItem className="text-foreground hover:bg-accent">
                  <Bookmark className="w-4 h-4 mr-2" />
                  Save to playlist
                </DropdownMenuItem>
                <DropdownMenuItem className="text-foreground hover:bg-accent">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem className="text-foreground hover:bg-accent">
                  <Flag className="w-4 h-4 mr-2" />
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="group cursor-pointer">
      <div className="space-y-4">
        {/* Thumbnail Container */}
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-muted">
          {showPlayer ? (
            <VideoPlayer
              src={video.video_url}
              poster={video.thumbnail_url}
              title={video.title}
              onTimeUpdate={handleTimeUpdate}
              className="w-full h-full rounded-2xl"
            />
          ) : (
            <div className="relative w-full h-full">
              <img
                src={video.thumbnail_url || "/placeholder.svg"}
                alt={video.title}
                className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
              />
              {video.duration && (
                <div className="absolute bottom-3 right-3 bg-black/80 text-white text-sm px-2 py-1 rounded-lg font-medium backdrop-blur-sm">
                  {video.duration}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="flex gap-3">
          <img
            src={video.channel_avatar || "/placeholder.svg?height=36&width=36"}
            alt={video.channel_name}
            className="w-9 h-9 rounded-full flex-shrink-0 object-cover"
          />
          <div className="flex-1 min-w-0 space-y-1">
            <h3 className="font-semibold text-foreground text-base leading-tight line-clamp-2 group-hover:text-muted-foreground">
              {video.title}
            </h3>
            <p className="text-muted-foreground text-sm font-medium">{video.channel_name}</p>
            <div className="flex items-center text-muted-foreground text-sm">
              <span>{formatViews(video.views)} views</span>
              <span className="mx-1">•</span>
              <span>{formatTimeAgo(video.uploaded_at)}</span>
            </div>
          </div>
        </div>

        {video.category && (
          <div className="px-3">
            <Badge variant="secondary" className="bg-secondary text-secondary-foreground border-border">
              {video.category}
            </Badge>
          </div>
        )}

        {video.tags && video.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 px-3">
            {video.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs border-border text-muted-foreground">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="px-3">
          <p className="text-muted-foreground text-sm line-clamp-2 mb-4">{video.description}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`text-muted-foreground hover:text-foreground ${liked ? "text-red-500" : ""}`}
              >
                <Heart className={`w-4 h-4 mr-1 ${liked ? "fill-current" : ""}`} />
                {video.likes}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDislike}
                className={`text-muted-foreground hover:text-foreground ${disliked ? "text-red-500" : ""}`}
              >
                <ThumbsDown className={`w-4 h-4 mr-1 ${disliked ? "fill-current" : ""}`} />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowComments(!showComments)
                  if (!showComments) fetchComments()
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                {comments.length}
              </Button>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className="text-muted-foreground hover:text-foreground"
              >
                <Share2 className="w-4 h-4" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-background border-border">
                  <DropdownMenuItem className="text-foreground hover:bg-accent">
                    <Bookmark className="w-4 h-4 mr-2" />
                    Save to playlist
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-foreground hover:bg-accent">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-foreground hover:bg-accent">
                    <Flag className="w-4 h-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {showComments && (
            <div className="border-t border-border pt-4 mt-4">
              <div className="flex space-x-2 mb-4">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="bg-background border-border text-foreground rounded-xl"
                />
                <Button
                  onClick={handleComment}
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-3 max-h-48 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <img
                      src={comment.user_avatar || "/placeholder.svg?height=24&width=24"}
                      alt={comment.user_name}
                      className="w-6 h-6 rounded-full flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground text-sm">@{comment.user_name}</span>
                        <span className="text-muted-foreground text-xs">{formatTimeAgo(comment.created_at)}</span>
                      </div>
                      <p className="text-muted-foreground text-sm">{comment.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
