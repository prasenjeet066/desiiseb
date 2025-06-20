"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Heart, MessageCircle, Download, Share2, Send, ThumbsDown } from "lucide-react"

interface VideoCardProps {
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
  }
  onUpdate: () => void
}

export default function VideoCard({ video, onUpdate }: VideoCardProps) {
  const [liked, setLiked] = useState(false)
  const [disliked, setDisliked] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [comments, setComments] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
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

      // Also update video_likes table
      if (liked) {
        await supabase.from("video_likes").delete().eq("video_id", video.id).eq("user_id", currentUser.id)
      } else {
        await supabase.from("video_likes").upsert({
          video_id: video.id,
          user_id: currentUser.id,
          is_like: true,
        })
      }

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

      // Also update video_likes table
      if (disliked) {
        await supabase.from("video_likes").delete().eq("video_id", video.id).eq("user_id", currentUser.id)
      } else {
        await supabase.from("video_likes").upsert({
          video_id: video.id,
          user_id: currentUser.id,
          is_like: false,
        })
      }

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
      // Get user profile for display name and avatar
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

  const handleDownload = async () => {
    if (!currentUser) return

    try {
      // Record the download
      await supabase.from("video_downloads").insert({
        video_id: video.id,
        user_id: currentUser.id,
        quality: video.quality || "HD",
        file_size: video.file_size || 0,
      })

      // Open download URL
      window.open(video.download_url || video.video_url, "_blank")
    } catch (error) {
      console.error("Error recording download:", error)
      // Still allow download even if recording fails
      window.open(video.download_url || video.video_url, "_blank")
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
      // You could add a toast notification here
    }
  }

  return (
    <div className="bg-card rounded-lg overflow-hidden border border-border">
      <div className="aspect-video bg-muted relative">
        <video src={video.video_url} poster={video.thumbnail_url} controls className="w-full h-full object-cover" />
      </div>

      <div className="p-4">
        <h3 className="font-bold text-foreground mb-2 line-clamp-2">{video.title}</h3>
        <div className="flex items-center mb-2">
          {video.channel_avatar && (
            <img
              src={video.channel_avatar || "/placeholder.svg"}
              alt={video.channel_name}
              className="w-6 h-6 rounded-full mr-2"
            />
          )}
          <p className="text-muted-foreground text-sm">@{video.channel_name}</p>
        </div>
        <p className="text-muted-foreground text-sm mb-2">{video.views} views</p>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{video.description}</p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
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
              {video.dislikes}
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
              onClick={handleDownload}
              className="text-muted-foreground hover:text-foreground"
            >
              <Download className="w-4 h-4" />
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
        </div>

        {showComments && (
          <div className="border-t border-border pt-4">
            <div className="flex space-x-2 mb-4">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="bg-background border-border text-foreground"
              />
              <Button
                onClick={handleComment}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3 max-h-48 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="text-sm">
                  <div className="flex items-center mb-1">
                    {comment.user_avatar && (
                      <img
                        src={comment.user_avatar || "/placeholder.svg"}
                        alt={comment.user_name}
                        className="w-4 h-4 rounded-full mr-2"
                      />
                    )}
                    <span className="font-medium text-foreground">@{comment.user_name}</span>
                  </div>
                  <p className="text-muted-foreground ml-6">{comment.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
