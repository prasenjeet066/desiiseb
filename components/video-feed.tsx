"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import ModernVideoCard from "./modern-video-card"
import { Video } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Upload } from "lucide-react"
import VideoFeedSkeleton from "./skeletons/video-feed-skeleton"

interface VideoType {
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
  liked_by?: string[]
  disliked_by?: string[]
}

export default function VideoFeed() {
  const [videos, setVideos] = useState<VideoType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      setError(null)
      const supabase = createClient()

      if (!supabase) {
        setError("Failed to initialize database connection")
        setVideos([])
        setLoading(false)
        return
      }

      // Query the correct table name 'video' (singular)
      const { data, error } = await supabase
        .from("video")
        .select("*")
        .eq("is_public", true)
        .order("uploaded_at", { ascending: false })
        .limit(20)

      if (error) {
        console.error("Database error:", error)
        setError(`Database error: ${error.message}`)
        setVideos([])
      } else {
        setVideos(data || [])
      }
    } catch (error) {
      console.error("Error fetching videos:", error)
      setError("Failed to load videos")
      setVideos([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <VideoFeedSkeleton />
  }

  if (error) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="w-24 h-24 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Video className="w-12 h-12 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Unable to load videos</h2>
        <p className="text-gray-400 text-lg mb-6">{error}</p>
        <Button onClick={fetchVideos} className="btn-primary">
          Try Again
        </Button>
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="text-center py-16 animate-fade-in">
        <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Video className="w-12 h-12 text-gray-600" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">No videos yet</h2>
        <p className="text-gray-400 text-lg mb-6">Be the first to upload a video!</p>
        <Link href="/upload">
          <Button className="btn-primary">
            <Upload className="w-4 h-4 mr-2" />
            Upload Video
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {videos.map((video, index) => (
        <div key={video.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.05}s` }}>
          <ModernVideoCard video={video} />
        </div>
      ))}
    </div>
  )
}
