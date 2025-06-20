"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ModernVideoCard from "./modern-video-card"
import { Grid, List, Search, Filter, TrendingUp, Clock, Heart } from "lucide-react"
import VideoFeedSkeleton from "./skeletons/video-feed-skeleton"

interface Video {
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

export default function EnhancedVideoFeed() {
  const [videos, setVideos] = useState<Video[]>([])
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [layout, setLayout] = useState<"grid" | "list">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("all")
  const supabase = createClient()

  useEffect(() => {
    fetchVideos()
  }, [])

  useEffect(() => {
    filterAndSortVideos()
  }, [videos, searchQuery, sortBy, categoryFilter, activeTab])

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from("video")
        .select("*")
        .eq("is_public", true)
        .order("uploaded_at", { ascending: false })

      if (error) throw error
      setVideos(data || [])
    } catch (error) {
      console.error("Error fetching videos:", error)
      setVideos([])
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortVideos = () => {
    let filtered = [...videos]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (video) =>
          video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.channel_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          video.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter((video) => video.category?.toLowerCase() === categoryFilter.toLowerCase())
    }

    // Filter by tab
    if (activeTab === "trending") {
      filtered = filtered.filter((video) => video.views > 1000)
    } else if (activeTab === "liked") {
      filtered = filtered.filter((video) => video.likes > 50)
    }

    // Sort videos
    switch (sortBy) {
      case "recent":
        filtered.sort((a, b) => new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime())
        break
      case "popular":
        filtered.sort((a, b) => b.views - a.views)
        break
      case "liked":
        filtered.sort((a, b) => b.likes - a.likes)
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime())
        break
    }

    setFilteredVideos(filtered)
  }

  const categories = ["all", "technology", "education", "entertainment", "music", "gaming", "sports"]

  if (loading) {
    return <VideoFeedSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search videos, channels, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-700 text-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="liked">Most Liked</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center bg-gray-800 rounded-lg p-1">
            <Button
              variant={layout === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setLayout("grid")}
              className="p-2"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={layout === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setLayout("list")}
              className="p-2"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-black">
            All Videos
          </TabsTrigger>
          <TabsTrigger value="trending" className="data-[state=active]:bg-white data-[state=active]:text-black">
            <TrendingUp className="w-4 h-4 mr-2" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="recent" className="data-[state=active]:bg-white data-[state=active]:text-black">
            <Clock className="w-4 h-4 mr-2" />
            Recent
          </TabsTrigger>
          <TabsTrigger value="liked" className="data-[state=active]:bg-white data-[state=active]:text-black">
            <Heart className="w-4 h-4 mr-2" />
            Most Liked
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredVideos.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-white mb-4">No videos found</h2>
              <p className="text-gray-400">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div
              className={
                layout === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"
              }
            >
              {filteredVideos.map((video) => (
                <ModernVideoCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
