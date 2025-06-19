"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import {
  AlertCircle,
  Upload,
  X,
  Loader2,
  PlayCircle,
  ImageIcon,
  Video,
  FileText,
  Settings,
  Eye,
  Globe,
  Lock,
  ChevronRight,
  ChevronLeft,
  CheckCircle,
  Calendar,
  MessageCircle,
  Download,
} from "lucide-react"

const categories = [
  { value: "technology", label: "Technology" },
  { value: "education", label: "Education" },
  { value: "entertainment", label: "Entertainment" },
  { value: "music", label: "Music" },
  { value: "gaming", label: "Gaming" },
  { value: "sports", label: "Sports" },
  { value: "news", label: "News & Politics" },
  { value: "howto", label: "Howto & Style" },
  { value: "travel", label: "Travel & Events" },
  { value: "autos", label: "Autos & Vehicles" },
]

const languages = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "ru", label: "Russian" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "zh", label: "Chinese" },
]

const licenses = [
  { value: "standard", label: "Standard License" },
  { value: "creative-commons", label: "Creative Commons - Attribution" },
  { value: "creative-commons-sa", label: "Creative Commons - Attribution-ShareAlike" },
  { value: "creative-commons-nc", label: "Creative Commons - Attribution-NonCommercial" },
]

const visibilityOptions = [
  {
    value: "public",
    label: "Public",
    description: "Anyone can search for and view your video",
    detail: "Visible to everyone and can appear in search results",
    icon: Globe,
  },
  {
    value: "unlisted",
    label: "Unlisted",
    description: "Anyone with the link can view your video",
    detail: "Won't appear in search results but accessible via direct link",
    icon: Eye,
  },
  {
    value: "private",
    label: "Private",
    description: "Only you can view your video",
    detail: "Only visible to you",
    icon: Lock,
  },
]

const steps = [
  { id: 1, title: "Upload", description: "Add your video file", icon: Upload },
  { id: 2, title: "Details", description: "Add title and description", icon: FileText },
  { id: 3, title: "Settings", description: "Configure visibility and options", icon: Settings },
  { id: 4, title: "Publish", description: "Review and publish", icon: CheckCircle },
]

export default function VideoUploadForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [thumbnailUrl, setThumbnailUrl] = useState("")
  const [category, setCategory] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [language, setLanguage] = useState("en")
  const [license, setLicense] = useState("standard")
  const [visibility, setVisibility] = useState("public")
  const [hasAiContent, setHasAiContent] = useState(false)
  const [hasAdvertisement, setHasAdvertisement] = useState(false)
  const [commentsEnabled, setCommentsEnabled] = useState(true)
  const [downloadEnabled, setDownloadEnabled] = useState(false)
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduledDate, setScheduledDate] = useState("")
  const [scheduledTime, setScheduledTime] = useState("")
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState("")

  const router = useRouter()
  const supabase = createClient()

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 15) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceedFromStep = (step: number) => {
    switch (step) {
      case 1:
        return videoUrl.trim() !== ""
      case 2:
        return title.trim() !== ""
      case 3:
        return true
      default:
        return true
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setUploadProgress(0)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + Math.random() * 10
        })
      }, 200)

      // Calculate upload date
      let uploadDate = new Date().toISOString()
      let scheduledUploadDate = null

      if (isScheduled && scheduledDate && scheduledTime) {
        scheduledUploadDate = new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
        if (new Date(scheduledUploadDate) > new Date()) {
          uploadDate = scheduledUploadDate
        }
      }

      const uploadData = {
        title: title.trim(),
        description: description.trim(),
        video_url: videoUrl.trim(),
        thumbnail_url: thumbnailUrl.trim() || null,
        category: category || "entertainment",
        tags: tags,
        user_id: user.id,
        channel_id: user.id,
        channel_name: user.user_metadata?.username || "Unknown User",
        channel_avatar: user.user_metadata?.avatar_url || "",
        views: 0,
        likes: 0,
        dislikes: 0,
        liked_by: [],
        disliked_by: [],
        is_public: visibility === "public",
        visibility: visibility,
        comments_enabled: commentsEnabled,
        download_enabled: downloadEnabled,
        language: language,
        license: license,
        has_ai_content: hasAiContent,
        has_advertisement: hasAdvertisement,
        scheduled_date: scheduledUploadDate,
        uploaded_at: uploadDate,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { error: insertError } = await supabase.from("video").insert(uploadData)

      if (insertError) {
        throw insertError
      }

      setUploadProgress(100)
      setTimeout(() => {
        router.push("/")
      }, 1500)
    } catch (error: any) {
      console.error("Upload error:", error)
      setError(error.message || "Failed to upload video. Please try again.")
      setUploadProgress(0)
    } finally {
      setLoading(false)
    }
  }

  const selectedVisibility = visibilityOptions.find((option) => option.value === visibility)

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Upload Video</h1>
        <p className="text-gray-400">Share your content with the world</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                  currentStep >= step.id ? "bg-blue-600 border-blue-600 text-white" : "border-gray-600 text-gray-400"
                }`}
              >
                {currentStep > step.id ? <CheckCircle className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
              </div>
              <div className="ml-3 hidden sm:block">
                <span className={`text-sm font-medium ${currentStep >= step.id ? "text-white" : "text-gray-400"}`}>
                  {step.title}
                </span>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && <ChevronRight className="w-5 h-5 text-gray-600 mx-4" />}
            </div>
          ))}
        </div>
        <Progress value={(currentStep / steps.length) * 100} className="h-2" />
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-700/50 text-red-400 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {loading && (
        <Card className="bg-blue-900/20 border-blue-700/50 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-300 mb-2">
                  {uploadProgress === 100 ? "Processing complete!" : "Publishing your video..."}
                </h3>
                <Progress value={uploadProgress} className="h-3 mb-2" />
                <p className="text-sm text-blue-200">
                  {uploadProgress === 100
                    ? "Your video has been published successfully. Redirecting..."
                    : `${Math.round(uploadProgress)}% complete`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Upload */}
            {currentStep === 1 && (
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Video className="w-5 h-5" />
                    Upload Video
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
                    {videoUrl ? (
                      <video
                        src={videoUrl}
                        className="w-full h-full object-cover rounded-lg"
                        controls
                        poster={thumbnailUrl}
                      />
                    ) : (
                      <div className="text-center text-gray-400">
                        <PlayCircle className="w-16 h-16 mx-auto mb-4" />
                        <p className="text-lg font-medium">Upload your video</p>
                        <p className="text-sm">Add your video URL below</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="videoUrl" className="text-sm font-medium text-white">
                      Video URL *
                    </Label>
                    <Input
                      id="videoUrl"
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      required
                      className="mt-1 bg-gray-800 border-gray-600 text-white"
                      placeholder="https://your-cdn.com/video.mp4"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-white">Thumbnail (Optional)</Label>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        {thumbnailUrl ? (
                          <div className="relative aspect-video bg-gray-800 rounded border border-gray-600">
                            <img
                              src={thumbnailUrl || "/placeholder.svg"}
                              alt="Thumbnail"
                              className="w-full h-full object-cover rounded"
                            />
                            <Button
                              type="button"
                              onClick={() => setThumbnailUrl("")}
                              className="absolute -top-2 -right-2 w-6 h-6 p-0 bg-red-600 hover:bg-red-700 rounded-full"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ) : (
                          <div className="aspect-video bg-gray-800 rounded border border-gray-600 border-dashed flex items-center justify-center">
                            <div className="text-center text-gray-400">
                              <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                              <p className="text-sm">Add thumbnail</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <div>
                        <Input
                          type="url"
                          value={thumbnailUrl}
                          onChange={(e) => setThumbnailUrl(e.target.value)}
                          className="bg-gray-800 border-gray-600 text-white"
                          placeholder="Thumbnail URL"
                        />
                        <p className="text-xs text-gray-400 mt-2">
                          Upload a custom thumbnail that represents your video content
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <FileText className="w-5 h-5" />
                    Video Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium text-white">
                      Title *
                    </Label>
                    <Textarea
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="mt-1 min-h-[60px] bg-gray-800 border-gray-600 text-white resize-none"
                      placeholder="Add a title that describes your video"
                      maxLength={100}
                    />
                    <div className="flex justify-end mt-1">
                      <span className={`text-xs ${title.length > 90 ? "text-red-400" : "text-gray-400"}`}>
                        {title.length}/100
                      </span>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-sm font-medium text-white">
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="mt-1 min-h-[120px] bg-gray-800 border-gray-600 text-white"
                      placeholder="Tell viewers about your video..."
                      maxLength={5000}
                    />
                    <div className="flex justify-end mt-1">
                      <span className={`text-xs ${description.length > 4500 ? "text-red-400" : "text-gray-400"}`}>
                        {description.length}/5000
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-white">Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="mt-1 bg-gray-800 border-gray-600 text-white">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {categories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value} className="text-white">
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium text-white">Language</Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="mt-1 bg-gray-800 border-gray-600 text-white">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {languages.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value} className="text-white">
                              {lang.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-white">Tags</Label>
                    <div className="mt-2 space-y-3">
                      <div className="flex gap-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="flex-1 bg-gray-800 border-gray-600 text-white"
                          placeholder="Add tags to help people find your video"
                          maxLength={30}
                        />
                        <Button
                          type="button"
                          onClick={addTag}
                          disabled={!newTag.trim() || tags.length >= 15}
                          className="bg-gray-700 hover:bg-gray-600 text-white"
                        >
                          Add
                        </Button>
                      </div>
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="bg-gray-700 text-white">
                              {tag}
                              <Button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="ml-2 p-0 h-auto bg-transparent hover:bg-transparent text-gray-400 hover:text-white"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-400">Tags help viewers find your video. {tags.length}/15</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Settings */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <Card className="bg-gray-900/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      {selectedVisibility?.icon && <selectedVisibility.icon className="w-5 h-5" />}
                      Visibility
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {visibilityOptions.map((option) => (
                      <div
                        key={option.value}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          visibility === option.value
                            ? "border-blue-500 bg-blue-900/20"
                            : "border-gray-700 hover:border-gray-600"
                        }`}
                        onClick={() => setVisibility(option.value)}
                      >
                        <div className="flex items-start gap-3">
                          <option.icon className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-white">{option.label}</h4>
                              {visibility === option.value && <CheckCircle className="w-4 h-4 text-blue-500" />}
                            </div>
                            <p className="text-sm text-gray-400 mt-1">{option.detail}</p>
                          </div>
                        </div>
                      </div>
                    ))}

                    <Separator className="bg-gray-700" />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium text-white flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Schedule
                          </Label>
                          <p className="text-xs text-gray-400 mt-1">Set your video to go live at a future date</p>
                        </div>
                        <Switch checked={isScheduled} onCheckedChange={setIsScheduled} />
                      </div>

                      {isScheduled && (
                        <div className="grid grid-cols-2 gap-2 pl-6">
                          <Input
                            type="date"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            className="bg-gray-800 border-gray-600 text-white"
                            min={new Date().toISOString().split("T")[0]}
                          />
                          <Input
                            type="time"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-900/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">More Options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium text-white flex items-center gap-2">
                          <MessageCircle className="w-4 h-4" />
                          Comments
                        </Label>
                        <p className="text-xs text-gray-400 mt-1">Allow viewers to comment</p>
                      </div>
                      <Switch checked={commentsEnabled} onCheckedChange={setCommentsEnabled} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium text-white flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          Downloads
                        </Label>
                        <p className="text-xs text-gray-400 mt-1">Let viewers download your video</p>
                      </div>
                      <Switch checked={downloadEnabled} onCheckedChange={setDownloadEnabled} />
                    </div>

                    <Separator className="bg-gray-700" />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm text-white">Contains AI-generated content</Label>
                        <Checkbox checked={hasAiContent} onCheckedChange={setHasAiContent} />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label className="text-sm text-white">Contains advertisement</Label>
                        <Checkbox checked={hasAdvertisement} onCheckedChange={setHasAdvertisement} />
                      </div>
                    </div>

                    <Separator className="bg-gray-700" />

                    <div>
                      <Label className="text-sm font-medium text-white">License</Label>
                      <Select value={license} onValueChange={setLicense}>
                        <SelectTrigger className="mt-1 bg-gray-800 border-gray-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-600">
                          {licenses.map((lic) => (
                            <SelectItem key={lic.value} value={lic.value} className="text-white">
                              {lic.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 4 && (
              <Card className="bg-gray-900/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <CheckCircle className="w-5 h-5" />
                    Review & Publish
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium text-white mb-2">Video Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Title:</span>
                            <span className="text-white">{title || "No title"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Category:</span>
                            <span className="text-white">{category || "No category"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Language:</span>
                            <span className="text-white">{languages.find((l) => l.value === language)?.label}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Tags:</span>
                            <span className="text-white">{tags.length} tags</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-white mb-2">Settings</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Visibility:</span>
                            <span className="text-white capitalize">{visibility}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Comments:</span>
                            <span className="text-white">{commentsEnabled ? "Enabled" : "Disabled"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Downloads:</span>
                            <span className="text-white">{downloadEnabled ? "Enabled" : "Disabled"}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">License:</span>
                            <span className="text-white">{licenses.find((l) => l.value === license)?.label}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-white mb-2">Preview</h4>
                      <div className="aspect-video bg-gray-800 rounded mb-3">
                        {thumbnailUrl ? (
                          <img
                            src={thumbnailUrl || "/placeholder.svg"}
                            alt="Preview"
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <h5 className="text-sm font-medium text-white line-clamp-2 mb-1">
                        {title || "Your video title"}
                      </h5>
                      <p className="text-xs text-gray-400 line-clamp-2">{description || "Your video description"}</p>
                    </div>
                  </div>

                  {isScheduled && scheduledDate && scheduledTime && (
                    <div className="bg-blue-900/20 border border-blue-700/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-blue-300">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm font-medium">Scheduled for publication</span>
                      </div>
                      <p className="text-sm text-blue-200 mt-1">
                        {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString()}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Preview Card */}
            <Card className="bg-gray-900/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video bg-gray-800 rounded mb-3">
                  {thumbnailUrl ? (
                    <img
                      src={thumbnailUrl || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-500" />
                    </div>
                  )}
                </div>
                <h4 className="text-sm font-medium text-white line-clamp-2 mb-1">
                  {title || "Your video title will appear here"}
                </h4>
                <p className="text-xs text-gray-400 line-clamp-2">
                  {description || "Your video description will appear here"}
                </p>
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="space-y-3">
              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={!canProceedFromStep(currentStep)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <div className="flex items-center gap-2">
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={loading || !title.trim() || !videoUrl.trim()}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {isScheduled ? "Scheduling..." : "Publishing..."}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      {isScheduled ? "Schedule Video" : "Publish Video"}
                    </div>
                  )}
                </Button>
              )}

              {currentStep > 1 && (
                <Button
                  type="button"
                  onClick={prevStep}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  <div className="flex items-center gap-2">
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </div>
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
