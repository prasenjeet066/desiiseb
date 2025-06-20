"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ModernVideoCard from "./modern-video-card"
import {
  Users,
  Eye,
  Heart,
  Video,
  Calendar,
  MapPin,
  LinkIcon,
  Settings,
  Share2,
  Grid,
  List,
  Edit,
  MoreHorizontal,
} from "lucide-react"
import ProfileSkeleton from "./skeletons/profile-skeleton"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface EnhancedUserProfileProps {
  user: User
}

export default function EnhancedUserProfile({ user }: EnhancedUserProfileProps) {
  const router = useRouter()
  const [videos, setVideos] = useState<any[]>([])
  const [likedVideos, setLikedVideos] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [videosLoading, setVideosLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("videos")
  const [layout, setLayout] = useState<"grid" | "list">("grid")
  const [isFollowing, setIsFollowing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchUserProfile()
    fetchUserVideos()
    fetchLikedVideos()
  }, [user.id])

  const fetchUserProfile = async () => {
    try {
      setError(null)
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (error && error.code !== "PGRST116") {
        console.error("Error fetching profile:", error)
        setError("Failed to load profile")
        return
      }

      setProfile(
        data || {
          id: user.id,
          display_name: user.user_metadata?.full_name || "",
          channel_name: user.user_metadata?.username || user.email?.split("@")[0] || "",
          avatar_url: user.user_metadata?.avatar_url || "",
          created_at: user.created_at,
        },
      )
    } catch (error) {
      console.error("Error fetching user profile:", error)
      setError("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const fetchUserVideos = async () => {
    try {
      setVideosLoading(true)
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("channel_id", user.id)
        .order("uploaded_at", { ascending: false })

      if (error) {
        console.error("Error fetching videos:", error)
        setVideos([])
        return
      }

      setVideos(data || [])
    } catch (error) {
      console.error("Error fetching user videos:", error)
      setVideos([])
    } finally {
      setVideosLoading(false)
    }
  }

  const fetchLikedVideos = async () => {
    try {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .contains("liked_by", [user.id])
        .order("uploaded_at", { ascending: false })

      if (error) {
        console.error("Error fetching liked videos:", error)
        return
      }

      setLikedVideos(data || [])
    } catch (error) {
      console.error("Error fetching liked videos:", error)
      setLikedVideos([])
    }
  }

  const handleFollow = async () => {
    setIsFollowing(!isFollowing)
    // TODO: Implement actual follow/unfollow logic
  }

  const formatNumber = (num: number) => {
    if (num < 1000) return num.toString()
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`
    return `${(num / 1000000).toFixed(1)}M`
  }

  const totalLikes = videos.reduce((acc, video) => acc + (video.likes || 0), 0)
  const totalViews = videos.reduce((acc, video) => acc + (video.views || 0), 0)

  if (loading) {
    return <ProfileSkeleton />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-red-500 text-lg mb-2">Error loading profile</div>
          <p className="text-gray-400 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Profile Header */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-48 md:h-64 bg-gray-800 rounded-lg overflow-hidden relative">
          {profile?.cover_photo_url && (
            <img
              src={profile.cover_photo_url || "/placeholder.svg"}
              alt="Cover"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none"
              }}
            />
          )}
          <div className="absolute inset-0 bg-black/20" />
        </div>

        {/* Profile Info */}
        <div className="relative -mt-16 px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            <div className="relative">
              <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-black bg-gray-800">
                <AvatarImage src={profile?.avatar_url || "/placeholder.svg?height=120&width=120"} alt="Profile" />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl md:text-4xl">
                  {(profile?.display_name || profile?.channel_name || user.email)?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {profile?.is_verified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 md:w-8 md:h-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-black">
                  <svg className="w-3 h-3 md:w-5 md:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2 truncate">
                    {profile?.display_name || profile?.channel_name || "User"}
                    {profile?.is_verified && <Badge className="bg-blue-500 shrink-0">Verified</Badge>}
                  </h1>
                  <p className="text-gray-400 text-lg truncate">
                    @{profile?.channel_name || user.email?.split("@")[0] || "username"}
                  </p>
                  {profile?.channel_description && (
                    <p className="text-gray-300 mt-2 max-w-2xl line-clamp-2">{profile.channel_description}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Link href="/profile/edit">
                    <Button className="bg-none text-gray-100">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  </Link>
                  <Link href="/studio">
                    <Button className="bg-yellow-400 text-gray-800">
                      
                      Go Studio
                    </Button>
                  </Link>
                  

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="border-gray-600 text-white">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem className="text-white hover:bg-gray-700">
                        <Settings className="w-4 h-4 mr-2" />
                        Settings
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-white hover:bg-gray-700">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Profile
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Profile Stats */}
              <div className="flex flex-wrap gap-4 md:gap-6 mt-4">
                <div className="flex items-center gap-2 text-gray-300">
                  <Video className="w-4 h-4" />
                  <span className="font-semibold">{formatNumber(videos.length)}</span>
                  <span className="hidden sm:inline">videos</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Users className="w-4 h-4" />
                  <span className="font-semibold">{formatNumber(profile?.subscribers || 0)}</span>
                  <span className="hidden sm:inline">subscribers</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Eye className="w-4 h-4" />
                  <span className="font-semibold">{formatNumber(totalViews)}</span>
                  <span className="hidden sm:inline">views</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Heart className="w-4 h-4" />
                  <span className="font-semibold">{formatNumber(totalLikes)}</span>
                  <span className="hidden sm:inline">likes</span>
                </div>
              </div>

              {/* Additional Info */}
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-400">
                {profile?.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile?.website && (
                  <div className="flex items-center gap-1">
                    <LinkIcon className="w-4 h-4" />
                    <a
                      href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white truncate max-w-[200px]"
                    >
                      {profile.website}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(profile?.created_at || user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="px-4 md:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="bg-gray-800 border-gray-700 w-full sm:w-auto">
              <TabsTrigger
                value="videos"
                className="data-[state=active]:bg-white data-[state=active]:text-black flex-1 sm:flex-none"
              >
                Videos ({videos.length})
              </TabsTrigger>
              <TabsTrigger
                value="liked"
                className="data-[state=active]:bg-white data-[state=active]:text-black flex-1 sm:flex-none"
              >
                Liked ({likedVideos.length})
              </TabsTrigger>
              <TabsTrigger
                value="playlists"
                className="data-[state=active]:bg-white data-[state=active]:text-black flex-1 sm:flex-none"
              >
                Playlists
              </TabsTrigger>
              <TabsTrigger
                value="about"
                className="data-[state=active]:bg-white data-[state=active]:text-black flex-1 sm:flex-none"
              >
                About
              </TabsTrigger>
            </TabsList>
          </Tabs>

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

        <Tabs value={activeTab}>
          <TabsContent value="videos">
            {videosLoading ? (
              <div className="text-center text-gray-400 py-8">Loading videos...</div>
            ) : videos.length === 0 ? (
              <div className="text-center py-12">
                <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No videos uploaded yet</h3>
                <p className="text-gray-400 mb-4">Start creating content to build your channel!</p>
                <Link href="/upload">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    Upload Your First Video
                  </Button>
                </Link>
              </div>
            ) : (
              <div
                className={
                  layout === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                    : "space-y-4"
                }
              >
                {videos.map((video) => (
                  <ModernVideoCard key={video.id} video={video} onUpdate={fetchUserVideos} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="liked">
            {likedVideos.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No liked videos yet</h3>
                <p className="text-gray-400">Videos you like will appear here</p>
              </div>
            ) : (
              <div
                className={
                  layout === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
                    : "space-y-4"
                }
              >
                {likedVideos.map((video) => (
                  <ModernVideoCard key={video.id} video={video} onUpdate={fetchLikedVideos} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="playlists">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-800 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Video className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No playlists yet</h3>
              <p className="text-gray-400 mb-4">Create playlists to organize your videos</p>
              <Button variant="outline" className="border-gray-600 text-gray-300">
                Create Playlist
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="about">
            <div className="max-w-4xl space-y-6">
              <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
                <h3 className="text-xl font-semibold text-white mb-4">Channel Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{formatNumber(videos.length)}</div>
                    <div className="text-gray-400">Total Videos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{formatNumber(totalViews)}</div>
                    <div className="text-gray-400">Total Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{formatNumber(totalLikes)}</div>
                    <div className="text-gray-400">Total Likes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{formatNumber(profile?.subscribers || 0)}</div>
                    <div className="text-gray-400">Subscribers</div>
                  </div>
                </div>
              </div>

              {(profile?.channel_description || profile?.bio) && (
                <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
                  <h3 className="text-xl font-semibold text-white mb-4">About</h3>
                  <div className="space-y-3">
                    {profile?.channel_description && (
                      <div>
                        <h4 className="text-gray-400 text-sm mb-1">Channel Description</h4>
                        <p className="text-gray-300 leading-relaxed">{profile.channel_description}</p>
                      </div>
                    )}
                    {profile?.bio && (
                      <div>
                        <h4 className="text-gray-400 text-sm mb-1">Bio</h4>
                        <p className="text-gray-300 leading-relaxed">{profile.bio}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
                <h3 className="text-xl font-semibold text-white mb-4">Details</h3>
                <div className="space-y-3 text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="truncate ml-2">{user.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Joined:</span>{" "}
                    <span>{new Date(profile?.created_at || user.created_at).toLocaleDateString()}</span>
                  </div>
                  {profile?.location && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Location:</span>
                      <span className="truncate ml-2">{profile.location}</span>
                    </div>
                  )}
                  {profile?.website && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Website:</span>{" "}
                      <a
                        href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 truncate ml-2"
                      >
                        {profile.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
