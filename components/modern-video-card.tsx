"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { MoreVertical, Bookmark, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ModernVideoCardProps {
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
    duration?: string
    category?: string
  }
  size?: "small" | "medium" | "large"
  showChannel?: boolean
  onUpdate?: () => void
}

export default function ModernVideoCard({
  video,
  size = "medium",
  showChannel = true,
  onUpdate,
}: ModernVideoCardProps) {
  const [isHovered, setIsHovered] = useState(false)

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

  const formatViews = (views: number) => {
    if (!views || views < 1000) return (views || 0).toString()
    if (views < 1000000) return `${(views / 1000).toFixed(1)}K`
    return `${(views / 1000000).toFixed(1)}M`
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      const shareUrl = `${window.location.origin}/watch/${video.id}`
      if (navigator.share) {
        await navigator.share({
          title: video.title,
          text: video.description,
          url: shareUrl,
        })
      } else {
        await navigator.clipboard.writeText(shareUrl)
      }
    } catch (error) {
      console.log("Share failed:", error)
    }
  }

  const handleSaveToPlaylist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log("Save to playlist:", video.id)
  }

  return (
    <div
      className="w-full group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/watch/${video.id}`}>
        <div className="space-y-3">
          {/* Thumbnail Container */}
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-gray-900">
            <img
              src={video.thumbnail_url || "/placeholder.svg"}
              alt={video.title}
              className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg?height=180&width=320"
              }}
            />

            {/* Duration Badge */}
            {video.duration && (
              <div className="absolute bottom-3 right-3 bg-black/80 text-white text-sm px-2 py-1 rounded-lg font-medium backdrop-blur-sm">
                {video.duration}
              </div>
            )}

            {/* Hover Overlay with Quick Actions */}
            <div
              className={`absolute inset-0 bg-black/20 transition-opacity duration-300 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="absolute top-3 right-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm"
                      onClick={(e) => e.preventDefault()}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-gray-900 border-gray-700">
                    <DropdownMenuItem onClick={handleShare} className="text-white hover:bg-gray-800">
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleSaveToPlaylist} className="text-white hover:bg-gray-800">
                      <Bookmark className="w-4 h-4 mr-2" />
                      Save to playlist
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Video Info */}
          <div className="flex gap-3">
            {/* Channel Avatar */}
            <div className="flex-shrink-0">
              <img
                src={video.channel_avatar || "/placeholder.svg?height=36&width=36"}
                alt={video.channel_name}
                className="w-9 h-9 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=36&width=36"
                }}
              />
            </div>

            {/* Video Details */}
            <div className="flex-1 min-w-0 space-y-1">
              {/* Video Title */}
              <h3 className="font-semibold text-white text-base leading-tight line-clamp-2 group-hover:text-gray-200 transition-colors">
                {video.title}
              </h3>

              {/* Channel Name */}
              <p className="text-gray-400 text-sm font-medium">{video.channel_name}</p>

              {/* Views and Date */}
              <div className="flex items-center text-gray-400 text-sm">
                <span>{formatViews(video.views)} views</span>
                <span className="mx-1">•</span>
                <span>{formatTimeAgo(video.uploaded_at)}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  )
}
