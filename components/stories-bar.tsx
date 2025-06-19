"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus } from "lucide-react"

interface Story {
  id: string
  user_id: string
  content?: string
  image_url?: string
  video_url?: string
  created_at: string
  profiles: {
    display_name: string
    channel_name: string
    avatar_url: string
  }
}

export default function StoriesBar() {
  const [stories, setStories] = useState<Story[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const supabase = createClient()

  useEffect(() => {
    getCurrentUser()
    fetchStories()
  }, [])

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setCurrentUser(user)
  }

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from("stories")
        .select(`
          *,
          profiles (
            display_name,
            channel_name,
            avatar_url
          )
        `)
        .gt("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) throw error
      setStories(data || [])
    } catch (error) {
      console.error("Error fetching stories:", error)
    }
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
      {/* Add Story Button */}
      {currentUser && (
        <div className="flex-shrink-0 text-center">
          <div className="relative">
            <Avatar className="w-16 h-16 border-2 border-gray-700">
              <AvatarImage src={currentUser.user_metadata?.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                {currentUser.email?.charAt(0)?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1">
              <Plus className="w-3 h-3 text-white" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Your Story</p>
        </div>
      )}

      {/* Stories */}
      {stories.map((story) => (
        <div key={story.id} className="flex-shrink-0 text-center cursor-pointer">
          <div className="relative">
            <Avatar className="w-16 h-16 border-2 border-gradient-to-r from-purple-500 to-pink-500 p-0.5">
              <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                <Avatar className="w-14 h-14">
                  <AvatarImage src={story.profiles?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm">
                    {story.profiles?.display_name?.charAt(0)?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </Avatar>
          </div>
          <p className="text-xs text-gray-400 mt-2 truncate w-16">
            {story.profiles?.display_name || story.profiles?.channel_name || "User"}
          </p>
        </div>
      ))}
    </div>
  )
}
