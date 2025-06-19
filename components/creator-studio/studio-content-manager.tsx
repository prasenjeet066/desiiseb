"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Upload, MoreHorizontal, Eye, ThumbsUp, MessageSquare, Edit, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"

interface StudioContentManagerProps {
  userId: string
}

interface Video {
  id: string
  title: string
  description: string
  thumbnail_url: string
  views: number
  likes: number
  dislikes: number
  uploaded_at: string
  visibility: string
  is_public: boolean
  category: string
  duration?: string
}

export default function StudioContentManager({ userId }: StudioContentManagerProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [filterBy, setFilterBy] = useState("all")
  const [comments, setComments] = useState<Record<string, number>>({})
  const supabase = createClient()

  useEffect(() => {
    fetchVideos()
  }, [userId])

  useEffect(() => {
    filterAndSortVideos()
  }, [videos, searchQuery, sortBy, filterBy])

  const fetchVideos = async () => {
    try {
      const { data: videosData, error } = await supabase
        .from("video")
        .select("*")
        .eq("channel_id", userId)
        .order("uploaded_at", { ascending: false })

      if (error) throw error

      setVideos(videosData || [])

      // Fetch comment counts
      if (videosData && videosData.length > 0) {
        const videoIds = videosData.map((v) => v.id)
        const { data: commentsData } = await supabase.from("comments").select("video_id").in("video_id", videoIds)

        const commentCounts: Record<string, number> = {}
        commentsData?.forEach((comment) => {
          commentCounts[comment.video_id] = (commentCounts[comment.video_id] || 0) + 1
        })
        setComments(commentCounts)
      }
    } catch (error) {
      console.error("Error fetching videos:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortVideos = () => {
    let filtered = [...videos]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (video) =>
          video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply visibility filter
    if (filterBy !== "all") {
      if (filterBy === "public") {
        filtered = filtered.filter((video) => video.is_public)
      } else if (filterBy === "private") {
        filtered = filtered.filter((video) => !video.is_public)
      }
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime())
        break
      case "most_views":
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0))
        break
      case "most_likes":
        filtered.sort((a, b) => (b.likes || 0) - (a.likes || 0))
        break
      case "alphabetical":
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
    }

    setFilteredVideos(filtered)
  }

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm("Are you sure you want to delete this video? This action cannot be undone.")) return

    try {
      const { error } = await supabase.from("video").delete().eq("id", videoId)

      if (error) throw error

      fetchVideos()
    } catch (error) {
      console.error("Error deleting video:", error)
      alert("Failed to delete video")
    }
  }

  const toggleVideoVisibility = async (videoId: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from("video")
        .update({
          is_public: !currentVisibility,
          visibility: !currentVisibility ? "public" : "private",
        })
        .eq("id", videoId)

      if (error) throw error

      fetchVideos()
    } catch (error) {
      console.error("Error updating video visibility:", error)
      alert("Failed to update video visibility")
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

  return (
    <main className="flex-1 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Content</h1>
            <p className="text-gray-400 mt-1">Manage your videos and content</p>
          </div>
          <Link href="/upload">
            <Button className="bg-red-600 hover:bg-red-700">
              <Upload className="w-4 h-4 mr-2" />
              Upload Video
            </Button>
          </Link>
        </div>

        {/* Filters and Search */}
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search your videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div className="flex items-center gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="most_views">Most Views</SelectItem>
                    <SelectItem value="most_likes">Most Likes</SelectItem>
                    <SelectItem value="alphabetical">A-Z</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Videos List */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Your Videos ({filteredVideos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-gray-800">
                    <div className="skeleton w-32 h-18 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="skeleton h-4 w-3/4 rounded"></div>
                      <div className="skeleton h-3 w-1/2 rounded"></div>
                      <div className="skeleton h-3 w-1/4 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredVideos.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">
                  {searchQuery || filterBy !== "all"
                    ? "No videos match your search criteria"
                    : "No videos uploaded yet"}
                </p>
                {!searchQuery && filterBy === "all" && (
                  <Link href="/upload">
                    <Button className="bg-red-600 hover:bg-red-700">Upload Your First Video</Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredVideos.map((video) => (
                  <div
                    key={video.id}
                    className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-800 transition-colors border border-gray-800"
                  >
                    <img
                      src={video.thumbnail_url || "/placeholder.svg?height=72&width=128"}
                      alt={video.title}
                      className="w-32 h-18 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium mb-1 line-clamp-1">{video.title}</h4>
                      <p className="text-gray-400 text-sm mb-2 line-clamp-2">{video.description}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {formatNumber(video.views || 0)} views
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          {formatNumber(video.likes || 0)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {comments[video.id] || 0}
                        </span>
                        {video.duration && <span>{video.duration}</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant={video.is_public ? "default" : "secondary"}
                          className={video.is_public ? "bg-green-600" : "bg-gray-600"}
                        >
                          {video.is_public ? "Public" : "Private"}
                        </Badge>
                        {video.category && (
                          <Badge variant="outline" className="border-gray-600 text-gray-400">
                            {video.category}
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">{formatTimeAgo(video.uploaded_at)}</span>
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
                          onClick={() => toggleVideoVisibility(video.id, video.is_public)}
                          className="text-gray-300 hover:text-white"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Make {video.is_public ? "Private" : "Public"}
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
      </div>
    </main>
  )
}
