"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LoadingSpinner, CardLoadingSpinner } from "@/components/ui/loading-spinner"
import {
  Settings,
  MoreHorizontal,
  Calendar,
  MapPin,
  LinkIcon,
  Users,
  Video,
  Eye,
  Heart,
  Play,
  Grid3X3,
  List,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface Profile {
  id: string
  username: string
  full_name: string
  avatar_url: string | null
  cover_photo_url: string | null
  bio: string | null
  website: string | null
  location: string | null
  created_at: string
}

interface VideoType {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  video_url: string
  views: number
  likes: number
  created_at: string
  visibility: string
  category: string | null
}

interface UserStats {
  totalVideos: number
  totalViews: number
  totalLikes: number
  joinDate: string
}

export default function EnhancedUserProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [videos, setVideos] = useState<VideoType[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [videosLoading, setVideosLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [videosError, setVideosError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("videos")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  const supabase = createClient()

  useEffect(() => {
    fetchProfile()
    fetchVideos()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setError("Please log in to view your profile")
        return
      }

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        throw profileError
      }

      // If no profile exists, create one from user metadata
      let finalProfile = profileData
      if (!profileData) {
        const newProfile = {
          id: user.id,
          username: user.user_metadata?.username || user.email?.split("@")[0] || "user",
          full_name: user.user_metadata?.full_name || user.email || "Anonymous User",
          avatar_url: user.user_metadata?.avatar_url || null,
          cover_photo_url: null,
          bio: null,
          website: null,
          location: null,
          created_at: user.created_at,
        }

        const { data: insertedProfile, error: insertError } = await supabase
          .from("profiles")
          .insert([newProfile])
          .select()
          .single()

        if (insertError) throw insertError
        finalProfile = insertedProfile
      }

      setProfile(finalProfile)

      // Calculate stats
      const { data: videoStats } = await supabase
        .from("videos")
        .select("views, likes, created_at")
        .eq("user_id", user.id)
        .eq("visibility", "public")

      const totalVideos = videoStats?.length || 0
      const totalViews = videoStats?.reduce((sum, video) => sum + (video.views || 0), 0) || 0
      const totalLikes = videoStats?.reduce((sum, video) => sum + (video.likes || 0), 0) || 0

      setStats({
        totalVideos,
        totalViews,
        totalLikes,
        joinDate: finalProfile.created_at,
      })
    } catch (err) {
      console.error("Error fetching profile:", err)
      setError("Failed to load profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const fetchVideos = async () => {
    try {
      setVideosLoading(true)
      setVideosError(null)

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data: videosData, error: videosError } = await supabase
        .from("videos")
        .select("*")
        .eq("user_id", user.id)
        .eq("visibility", "public")
        .order("created_at", { ascending: false })

      if (videosError) throw videosError

      setVideos(videosData || [])
    } catch (err) {
      console.error("Error fetching videos:", err)
      setVideosError("Failed to load videos. Please try again.")
    } finally {
      setVideosLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatWebsiteUrl = (url: string | null) => {
    if (!url) return null
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url
    }
    return `https://${url}`
  }

  if (loading) {
    return <LoadingSpinner size="xl" className="min-h-screen" />
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h3 className="text-lg font-semibold text-red-600">Error Loading Profile</h3>
            <p className="text-gray-600">{error}</p>
            <Button onClick={fetchProfile} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto" />
            <h3 className="text-lg font-semibold">Profile Not Found</h3>
            <p className="text-gray-600">Unable to load profile information.</p>
            <Button onClick={fetchProfile} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black text-white">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Profile Header */}
        <div className="relative">
          {/* Cover Photo */}
          <div className="h-48 md:h-64 rounded-xl overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
            {profile.cover_photo_url ? (
              <img
                src={profile.cover_photo_url || "/placeholder.svg"}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
            )}
          </div>

          {/* Profile Info */}
          <div className="relative -mt-16 px-6">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-black">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-500">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <h1 className="text-2xl md:text-3xl font-bold truncate">{profile.full_name}</h1>
                    <p className="text-gray-400">@{profile.username}</p>
                    {profile.bio && <p className="text-gray-300 max-w-2xl">{profile.bio}</p>}
                  </div>

                  <div className="flex items-center gap-3">
                    <Button asChild>
                      <Link href="/profile/edit">
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Link>
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Share Profile</DropdownMenuItem>
                        <DropdownMenuItem>Copy Link</DropdownMenuItem>
                        <DropdownMenuItem>Report</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Profile Stats */}
                {stats && (
                  <div className="flex flex-wrap gap-6 mt-4">
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-blue-400" />
                      <span className="text-sm">
                        <strong>{formatNumber(stats.totalVideos)}</strong> videos
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-green-400" />
                      <span className="text-sm">
                        <strong>{formatNumber(stats.totalViews)}</strong> views
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-red-400" />
                      <span className="text-sm">
                        <strong>{formatNumber(stats.totalLikes)}</strong> likes
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span className="text-sm">
                        <strong>0</strong> subscribers
                      </span>
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-400">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center gap-1">
                      <LinkIcon className="w-3 h-3" />
                      <a
                        href={formatWebsiteUrl(profile.website)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-400 transition-colors"
                      >
                        {profile.website}
                      </a>
                    </div>
                  )}
                  {stats && (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Joined {formatDistanceToNow(new Date(stats.joinDate), { addSuffix: true })}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="px-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="grid w-full max-w-md grid-cols-4">
                <TabsTrigger value="videos">Videos</TabsTrigger>
                <TabsTrigger value="playlists">Playlists</TabsTrigger>
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="about">About</TabsTrigger>
              </TabsList>

              {activeTab === "videos" && (
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>

            <TabsContent value="videos" className="space-y-6">
              {videosLoading ? (
                <CardLoadingSpinner />
              ) : videosError ? (
                <Card>
                  <CardContent className="p-6 text-center space-y-4">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
                    <h3 className="text-lg font-semibold text-red-600">Error Loading Videos</h3>
                    <p className="text-gray-400">{videosError}</p>
                    <Button onClick={fetchVideos}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              ) : videos.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center space-y-4">
                    <Video className="w-16 h-16 text-gray-500 mx-auto" />
                    <h3 className="text-xl font-semibold">No videos yet</h3>
                    <p className="text-gray-400 max-w-md mx-auto">
                      Start creating content to build your channel. Upload your first video to get started!
                    </p>
                    <Button asChild>
                      <Link href="/upload">
                        <Play className="w-4 h-4 mr-2" />
                        Upload Video
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                      : "space-y-4"
                  }
                >
                  {videos.map((video) => (
                    <Card key={video.id} className="group hover:shadow-lg transition-all duration-200">
                      <Link href={`/watch/${video.id}`}>
                        <div className={viewMode === "grid" ? "space-y-3" : "flex gap-4 p-4"}>
                          <div className={viewMode === "grid" ? "aspect-video" : "w-40 aspect-video flex-shrink-0"}>
                            <img
                              src={video.thumbnail_url || "/placeholder.svg?height=180&width=320"}
                              alt={video.title}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                          <div className={viewMode === "grid" ? "p-4 space-y-2" : "flex-1 space-y-2"}>
                            <h3 className="font-semibold line-clamp-2 group-hover:text-blue-400 transition-colors">
                              {video.title}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span>{formatNumber(video.views)} views</span>
                              <span>{formatDistanceToNow(new Date(video.created_at), { addSuffix: true })}</span>
                            </div>
                            {video.category && (
                              <Badge variant="secondary" className="text-xs">
                                {video.category}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Link>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="playlists">
              <Card>
                <CardContent className="p-12 text-center space-y-4">
                  <List className="w-16 h-16 text-gray-500 mx-auto" />
                  <h3 className="text-xl font-semibold">No playlists yet</h3>
                  <p className="text-gray-400">Create playlists to organize your videos</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="posts">
              <Card>
                <CardContent className="p-12 text-center space-y-4">
                  <Heart className="w-16 h-16 text-gray-500 mx-auto" />
                  <h3 className="text-xl font-semibold">No posts yet</h3>
                  <p className="text-gray-400">Share updates with your audience</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="about">
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">About</h3>
                    <p className="text-gray-300">{profile.bio || "No bio available."}</p>
                  </div>

                  {stats && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Stats</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-gray-800 rounded-lg">
                          <div className="text-2xl font-bold text-blue-400">{formatNumber(stats.totalVideos)}</div>
                          <div className="text-sm text-gray-400">Videos</div>
                        </div>
                        <div className="text-center p-4 bg-gray-800 rounded-lg">
                          <div className="text-2xl font-bold text-green-400">{formatNumber(stats.totalViews)}</div>
                          <div className="text-sm text-gray-400">Views</div>
                        </div>
                        <div className="text-center p-4 bg-gray-800 rounded-lg">
                          <div className="text-2xl font-bold text-red-400">{formatNumber(stats.totalLikes)}</div>
                          <div className="text-sm text-gray-400">Likes</div>
                        </div>
                        <div className="text-center p-4 bg-gray-800 rounded-lg">
                          <div className="text-2xl font-bold text-purple-400">0</div>
                          <div className="text-sm text-gray-400">Subscribers</div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Details</h3>
                    <div className="space-y-2 text-sm">
                      {profile.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{profile.location}</span>
                        </div>
                      )}
                      {profile.website && (
                        <div className="flex items-center gap-2">
                          <LinkIcon className="w-4 h-4 text-gray-400" />
                          <a
                            href={formatWebsiteUrl(profile.website)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:underline"
                          >
                            {profile.website}
                          </a>
                        </div>
                      )}
                      {stats && (
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span>Joined {formatDistanceToNow(new Date(stats.joinDate), { addSuffix: true })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
