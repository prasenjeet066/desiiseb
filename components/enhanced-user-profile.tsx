"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ModernVideoCard from "./modern-video-card"
import { Users, Eye, Heart, Video, Calendar, MapPin, LinkIcon, Settings, Bell, Share2, Grid, List } from "lucide-react"
import ProfileSkeleton from "./skeletons/profile-skeleton"
import { useRouter } from "next/navigation"
interface EnhancedUserProfileProps {
  user: User
}

export default function EnhancedUserProfile({ user }: EnhancedUserProfileProps) {
  const [videos, setVideos] = useState<any[]>([])
  const [likedVideos, setLikedVideos] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("videos")
  const [layout, setLayout] = useState<"grid" | "list">("grid")
  const [isFollowing, setIsFollowing] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchUserProfile()
    fetchUserVideos()
    fetchLikedVideos()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (error && error.code !== "PGRST116") throw error
      setProfile(data || {})
    } catch (error) {
      console.error("Error fetching user profile:", error)
    }
  }

  const fetchUserVideos = async () => {
    try {
      const { data, error } = await supabase
        .from("video")
        .select("*")
        .eq("channel_id", user.id)
        .order("uploaded_at", { ascending: false })

      if (error) throw error
      setVideos(data || [])
    } catch (error) {
      console.error("Error fetching user videos:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchLikedVideos = async () => {
    try {
      const { data, error } = await supabase
        .from("video")
        .select("*")
        .contains("liked_by", [user.id])
        .order("uploaded_at", { ascending: false })

      if (error) throw error
      setLikedVideos(data || [])
    } catch (error) {
      console.error("Error fetching liked videos:", error)
    }
  }

  /**const handleEdit = async () => {
    return null;
  }**/
   // ... rest of your imports

  //export default function EnhancedUserProfile({ user }: EnhancedUserProfileProps) {
    // ... 
  const router = useRouter();

  const handleEdit = () => { router.push("/profile/edit"); }
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

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Profile Header */}
      <div className="flex gap-8 animate-fade-in">
  {/* Sidebar */}
  <aside className="hidden md:block w-64 bg-gray-900 rounded-lg p-6 h-fit self-start">
    <h2 className="text-lg font-semibold text-white mb-4">Sidebar</h2>
    <ul className="space-y-2">
      <li>
        <a href="/dashboard" className="text-gray-300 hover:text-white">Dashboard</a>
      </li>
      <li>
        <a href="/profile/edit" className="text-gray-300 hover:text-white">Edit Profile</a>
      </li>
      <li>
        <a href="/settings" className="text-gray-300 hover:text-white">Settings</a>
      </li>
      {/* Add more sidebar items as needed */}
    </ul>
  </aside>

  {/* Main Profile Content */}
  <div className="flex-1 space-y-8">
    /* ...paste your current profile code here (everything previously in the outer div)... */
      <div className="relative">
        {/* Cover Image */}
        <div className="h-48 md:h-64 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg overflow-hidden">
          {profile?.cover_image && (
            <img src={profile.cover_image || "/placeholder.svg"} alt="Cover" className="w-full h-full object-cover" />
          )}
        </div>

        {/* Profile Info */}
        <div className="relative -mt-16 px-6">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            <div className="relative">
              <img
                src={profile?.avatar_url || "/placeholder.svg?height=120&width=120"}
                alt="Profile"
                className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-black bg-gray-800"
              />
              {profile?.is_verified && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
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
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2">
                    {profile?.display_name || profile?.channel_name || user.user_metadata?.username || "User"}
                    {profile?.is_verified && <Badge className="bg-blue-500">Verified</Badge>}
                  </h1>
                  <p className="text-gray-400 text-lg">@{profile?.channel_name || "username"}</p>
                  {profile?.channel_description && (
                    <p className="text-gray-300 mt-2 max-w-2xl">{profile.channel_description}</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <Button onClick={handleEdit} className="bg-white text-black hover:bg-gray-200">
                    {"Customize"}
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-600 text-white">
                    <Bell className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-600 text-white">
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="border-gray-600 text-white">
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Profile Stats */}
              <div className="flex flex-wrap gap-6 mt-4">
                <div className="flex items-center gap-2 text-gray-300">
                  <Video className="w-4 h-4" />
                  <span className="font-semibold">{formatNumber(videos.length)}</span>
                  <span>videos</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Users className="w-4 h-4" />
                  <span className="font-semibold">{formatNumber(profile?.subscribers || 0)}</span>
                  <span>subscribers</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Eye className="w-4 h-4" />
                  <span className="font-semibold">{formatNumber(totalViews)}</span>
                  <span>views</span>
                </div>
                <div className="flex items-center gap-2 text-gray-300">
                  <Heart className="w-4 h-4" />
                  <span className="font-semibold">{formatNumber(totalLikes)}</span>
                  <span>likes</span>
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
                    <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:text-white">
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
      <div className="px-6">
        <div className="flex items-center justify-between mb-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
            <TabsList className="bg-gray-800 border-gray-700">
              <TabsTrigger value="videos" className="data-[state=active]:bg-white data-[state=active]:text-black">
                Videos ({videos.length})
              </TabsTrigger>
              <TabsTrigger value="liked" className="data-[state=active]:bg-white data-[state=active]:text-black">
                Liked ({likedVideos.length})
              </TabsTrigger>
              <TabsTrigger value="playlists" className="data-[state=active]:bg-white data-[state=active]:text-black">
                Playlists
              </TabsTrigger>
              <TabsTrigger value="about" className="data-[state=active]:bg-white data-[state=active]:text-black">
                About
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center bg-gray-800 rounded-lg p-1 ml-4">
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
            {loading ? (
              <div className="text-center text-gray-400">Loading videos...</div>
            ) : videos.length === 0 ? (
              <div className="text-center py-12">
                <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No videos uploaded yet</h3>
                <p className="text-gray-400">Start creating content to build your channel!</p>
              </div>
            ) : (
              <div
                className={
                  layout === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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
              <p className="text-gray-400">Create playlists to organize your videos</p>
            </div>
          </TabsContent>

          <TabsContent value="about">
            <div className="max-w-4xl space-y-6">
              <div className="bg-gray-900 rounded-lg p-6">
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

              {profile?.channel_description && (
                <div className="bg-gray-900 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">About</h3>
                  <p className="text-gray-300 leading-relaxed">{profile.channel_description}</p>
                </div>
              )}

              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Details</h3>
                <div className="space-y-3 text-gray-300">
                  <div>
                    <span className="text-gray-400">Email:</span> {user.email}
                  </div>
                  <div>
                    <span className="text-gray-400">Joined:</span>{" "}
                    {new Date(profile?.created_at || user.created_at).toLocaleDateString()}
                  </div>
                  {profile?.location && (
                    <div>
                      <span className="text-gray-400">Location:</span> {profile.location}
                    </div>
                  )}
                  {profile?.website && (
                    <div>
                      <span className="text-gray-400">Website:</span>{" "}
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-400">
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
   </div>  
      </div>
  )
}
