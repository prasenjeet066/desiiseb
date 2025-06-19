"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, Save, X } from "lucide-react"
import { useRouter } from "next/navigation"

interface EditProfileFormProps {
  user: any
  profile: any
}

export default function EditProfileForm({ user, profile }: EditProfileFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    display_name: profile?.display_name || "",
    channel_name: profile?.channel_name || "",
    channel_description: profile?.channel_description || "",
    bio: profile?.bio || "",
    website: profile?.website || "",
    location: profile?.location || "",
    avatar_url: profile?.avatar_url || "",
    cover_photo_url: profile?.cover_photo_url || "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileUpload = async (file: File, type: "avatar" | "cover") => {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${user.id}-${type}-${Date.now()}.${fileExt}`
      const filePath = `${type}s/${fileName}`

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)

      setFormData((prev) => ({
        ...prev,
        [type === "avatar" ? "avatar_url" : "cover_photo_url"]: data.publicUrl,
      }))
    } catch (error) {
      console.error("Error uploading file:", error)
      alert("Error uploading file. Please try again.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        ...formData,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      alert("Profile updated successfully!")
      router.push("/profile")
    } catch (error) {
      console.error("Error updating profile:", error)
      alert("Error updating profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Cover Photo Section */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="p-0">
          <div className="relative h-48 bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-lg overflow-hidden">
            {formData.cover_photo_url && (
              <img
                src={formData.cover_photo_url || "/placeholder.svg"}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/20" />
            <div className="absolute bottom-4 right-4">
              <label htmlFor="cover-upload" className="cursor-pointer">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="bg-black/50 hover:bg-black/70 text-white"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Change Cover
                </Button>
                <input
                  id="cover-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file, "cover")
                  }}
                />
              </label>
            </div>
          </div>

          {/* Avatar Section */}
          <div className="relative px-6 pb-6">
            <div className="flex items-end gap-6 -mt-16">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-gray-900">
                  <AvatarImage src={formData.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-2xl">
                    {formData.display_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label htmlFor="avatar-upload" className="absolute bottom-2 right-2 cursor-pointer">
                  <div className="bg-gray-800 hover:bg-gray-700 rounded-full p-2 border-2 border-gray-900">
                    <Camera className="w-4 h-4 text-white" />
                  </div>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(file, "avatar")
                    }}
                  />
                </label>
              </div>
              <div className="flex-1 pb-4">
                <h2 className="text-2xl font-bold text-white">{formData.display_name || "Your Name"}</h2>
                <p className="text-gray-400">@{formData.channel_name || "username"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Display Name</label>
              <Input
                name="display_name"
                value={formData.display_name}
                onChange={handleInputChange}
                placeholder="Your display name"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Channel Name</label>
              <Input
                name="channel_name"
                value={formData.channel_name}
                onChange={handleInputChange}
                placeholder="Your channel name"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <Input value={user.email} disabled className="bg-gray-800 border-gray-700 text-gray-400" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Website</label>
              <Input
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://yourwebsite.com"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
              <Input
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Your location"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white">About</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
              <Textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself..."
                rows={4}
                className="bg-gray-800 border-gray-700 text-white resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Channel Description</label>
              <Textarea
                name="channel_description"
                value={formData.channel_description}
                onChange={handleInputChange}
                placeholder="Describe your channel..."
                rows={6}
                className="bg-gray-800 border-gray-700 text-white resize-none"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="border-gray-700 text-gray-300 hover:bg-gray-800"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Save className="w-4 h-4 mr-2" />
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
