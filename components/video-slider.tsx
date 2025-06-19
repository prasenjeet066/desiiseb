"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { ChevronLeft, ChevronRight, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface Video {
  id: string
  title: string
  description: string
  video_url: string
  thumbnail_url: string
  channel_name: string
  channel_avatar: string
  views: number
  duration?: string
}

export default function VideoSlider() {
  const [videos, setVideos] = useState<Video[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchTrendingVideos()
  }, [])

  const fetchTrendingVideos = async () => {
    try {
      const { data, error } = await supabase
        .from("videos")
        .select(`
          id,
          title,
          description,
          video_url,
          thumbnail_url,
          channel_name,
          channel_avatar,
          views,
          duration
        `)
        .eq("visibility", "public")
        .order("views", { ascending: false })
        .limit(10)

      if (error) throw error
      setVideos(data || [])
    } catch (error) {
      console.error("Error fetching trending videos:", error)
    } finally {
      setLoading(false)
    }
  }

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % videos.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length)
  }

  const formatViews = (views: number) => {
    if (views < 1000) return views.toString()
    if (views < 1000000) return `${(views / 1000).toFixed(1)}K`
    return `${(views / 1000000).toFixed(1)}M`
  }

  if (loading) {
    return (
      <div className="relative w-full h-[400px] md:h-[500px] bg-gray-900 rounded-2xl animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-2xl" />
      </div>
    )
  }

  if (videos.length === 0) return null

  const currentVideo = videos[currentIndex]

  return (
    <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-2xl group">
      {/* Background Video/Image */}
      <div className="absolute inset-0">
        <img
          src={currentVideo.thumbnail_url || "/placeholder.svg"}
          alt={currentVideo.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="sm"
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <ChevronLeft className="w-5 h-5" />
      </Button>

      <Button
        variant="ghost"
        size="sm"
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <ChevronRight className="w-5 h-5" />
      </Button>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
        <div className="max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <img
              src={currentVideo.channel_avatar || "/placeholder.svg"}
              alt={currentVideo.channel_name}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="text-white font-medium">{currentVideo.channel_name}</p>
              <p className="text-gray-300 text-sm">{formatViews(currentVideo.views)} views</p>
            </div>
          </div>

          <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 line-clamp-2">{currentVideo.title}</h2>

          <p className="text-gray-200 text-sm md:text-base mb-6 line-clamp-2">{currentVideo.description}</p>

          <Link href={`/watch/${currentVideo.id}`}>
            <Button className="bg-white text-black hover:bg-gray-200 font-semibold px-6 py-3">
              <Play className="w-5 h-5 mr-2" />
              Watch Now
            </Button>
          </Link>
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 right-4 flex space-x-2">
        {videos.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? "bg-white" : "bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  )
}
