"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import ModernVideoCard from "./modern-video-card"
import { Search, Filter } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import SearchSkeleton from "./skeletons/search-skeleton"

interface SearchResultsProps {
  query: string
}

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
  duration?: string
  category?: string
}

export default function SearchResults({ query }: SearchResultsProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState("relevance")
  const [filterBy, setFilterBy] = useState("all")
  const supabase = createClient()

  useEffect(() => {
    if (query) {
      searchVideos()
    } else {
      setVideos([])
      setLoading(false)
    }
  }, [query, sortBy, filterBy])

  const searchVideos = async () => {
    setLoading(true)
    try {
      let queryBuilder = supabase.from("video").select("*").eq("is_public", true)

      // Search in title, description, and channel name
      if (query) {
        queryBuilder = queryBuilder.or(
          `title.ilike.%${query}%,description.ilike.%${query}%,channel_name.ilike.%${query}%`,
        )
      }

      // Apply filters
      if (filterBy !== "all") {
        queryBuilder = queryBuilder.eq("category", filterBy)
      }

      // Apply sorting
      switch (sortBy) {
        case "recent":
          queryBuilder = queryBuilder.order("uploaded_at", { ascending: false })
          break
        case "popular":
          queryBuilder = queryBuilder.order("views", { ascending: false })
          break
        case "liked":
          queryBuilder = queryBuilder.order("likes", { ascending: false })
          break
        default: // relevance
          queryBuilder = queryBuilder.order("views", { ascending: false })
      }

      const { data, error } = await queryBuilder.limit(50)

      if (error) throw error
      setVideos(data || [])
    } catch (error) {
      console.error("Error searching videos:", error)
      setVideos([])
    } finally {
      setLoading(false)
    }
  }

  if (!query) {
    return (
      <div className="text-center py-12">
        <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Search for videos</h2>
        <p className="text-gray-400">Enter a search term to find videos, channels, and more</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Search results for "{query}"</h1>
          <p className="text-gray-400">{loading ? "Searching..." : `${videos.length} results found`}</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Most Relevant</SelectItem>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="liked">Most Liked</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterBy} onValueChange={setFilterBy}>
            <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="entertainment">Entertainment</SelectItem>
              <SelectItem value="music">Music</SelectItem>
              <SelectItem value="gaming">Gaming</SelectItem>
              <SelectItem value="sports">Sports</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <SearchSkeleton />
      ) : videos.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">No results found</h2>
          <p className="text-gray-400">Try different keywords or check your spelling</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video) => (
            <ModernVideoCard key={video.id} video={video} />
          ))}
        </div>
      )}
    </div>
  )
}
