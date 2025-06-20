"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import type { User } from "@supabase/supabase-js"
import VideoCard from "./video-card"

interface UserProfileProps {
  user: User
}

export default function UserProfile({ user }: UserProfileProps) {
  const [videos, setVideos] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchUserProfile()
    fetchUserVideos()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      if (error && error.code !== "PGRST116") throw error
      setProfile(data)
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

  return (
    <div className="space-y-8">
      <div className="text-center">
        {profile?.avatar_url && (
          <img
            src={profile.avatar_url || "/placeholder.svg"}
            alt="Profile"
            className="w-24 h-24 rounded-full mx-auto mb-4"
          />
        )}
        <h1 className="text-3xl font-bold text-white mb-2">
          @{profile?.channel_name || profile?.display_name || user.user_metadata?.username || "User"}
        </h1>
        <p className="text-gray-400">{user.email}</p>
        {profile?.channel_description && <p className="text-gray-300 mt-2">{profile.channel_description}</p>}
        <div className="mt-4 flex justify-center space-x-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{profile?.total_videos || videos.length}</div>
            <div className="text-gray-400">Videos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{profile?.total_views || 0}</div>
            <div className="text-gray-400">Views</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{profile?.subscribers || 0}</div>
            <div className="text-gray-400">Subscribers</div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Your Videos</h2>
        {loading ? (
          <div className="text-center text-gray-400">Loading videos...</div>
        ) : videos.length === 0 ? (
          <div className="text-center text-gray-400">No videos uploaded yet</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} onUpdate={fetchUserVideos} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
