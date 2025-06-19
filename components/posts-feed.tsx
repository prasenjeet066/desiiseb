"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, MessageCircle, Share2, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Post {
  id: string
  user_id: string
  content: string
  image_url?: string
  video_url?: string
  likes: number
  liked_by: string[]
  comments_count: number
  created_at: string
  profiles: {
    display_name: string
    channel_name: string
    avatar_url: string
  }
}

export default function PostsFeed() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    getCurrentUser()
    fetchPosts()
  }, [])

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select(`
          *,
          profiles (
            display_name,
            channel_name,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (postId: string, currentLikes: number, likedBy: string[]) => {
    if (!currentUser) return

    try {
      const isLiked = likedBy.includes(currentUser.id)
      const newLikedBy = isLiked ? likedBy.filter((id) => id !== currentUser.id) : [...likedBy, currentUser.id]

      await supabase
        .from("posts")
        .update({
          liked_by: newLikedBy,
          likes: newLikedBy.length,
        })
        .eq("id", postId)

      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? { ...post, liked_by: newLikedBy, likes: newLikedBy.length } : post)),
      )
    } catch (error) {
      console.error("Error liking post:", error)
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

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-gray-900/50 border-gray-800 animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gray-700 rounded-full" />
                <div className="space-y-2">
                  <div className="w-32 h-4 bg-gray-700 rounded" />
                  <div className="w-20 h-3 bg-gray-700 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="w-full h-4 bg-gray-700 rounded" />
                <div className="w-3/4 h-4 bg-gray-700 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={post.id} className="bg-gray-900/50 border-gray-800 hover:bg-gray-900/70 transition-colors">
          <CardContent className="p-6">
            {/* Post Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={post.profiles?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    {post.profiles?.display_name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold text-white">
                    {post.profiles?.display_name || post.profiles?.channel_name || "Unknown User"}
                  </h4>
                  <p className="text-gray-400 text-sm">{formatTimeAgo(post.created_at)}</p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-gray-900 border-gray-700">
                  <DropdownMenuItem className="text-white hover:bg-gray-800">Save post</DropdownMenuItem>
                  <DropdownMenuItem className="text-white hover:bg-gray-800">Report</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Post Content */}
            <div className="mb-4">
              <p className="text-gray-300 whitespace-pre-wrap">{post.content}</p>

              {post.image_url && (
                <div className="mt-4">
                  <img
                    src={post.image_url || "/placeholder.svg"}
                    alt="Post image"
                    className="w-full max-h-96 object-cover rounded-xl"
                  />
                </div>
              )}

              {post.video_url && (
                <div className="mt-4">
                  <video src={post.video_url} controls className="w-full max-h-96 rounded-xl" />
                </div>
              )}
            </div>

            {/* Post Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-800">
              <div className="flex items-center gap-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(post.id, post.likes, post.liked_by)}
                  className={`text-gray-400 hover:text-white ${
                    currentUser && post.liked_by.includes(currentUser.id) ? "text-red-500" : ""
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 mr-2 ${
                      currentUser && post.liked_by.includes(currentUser.id) ? "fill-current" : ""
                    }`}
                  />
                  {post.likes}
                </Button>

                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  {post.comments_count}
                </Button>

                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
