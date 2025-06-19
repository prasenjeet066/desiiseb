import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import VideoUploadForm from "@/components/video-upload-form"
import PageWithSidebar from "@/components/page-with-sidebar"
import { Upload } from "lucide-react"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export default async function UploadPage() {
  try {
    const supabase = createClient()

    if (!supabase) {
      console.error("Failed to create Supabase client")
      redirect("/auth/login")
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      redirect("/auth/login")
    }

    return (
      <PageWithSidebar>
        <div className="min-h-screen bg-gradient-to-b from-gray-950 to-black">
          <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center">
                  <Upload className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Upload videos</h1>
                  <p className="text-gray-400">Post content to your channel</p>
                </div>
              </div>
            </div>

            {/* Upload Form */}
            <VideoUploadForm />
          </div>
        </div>
      </PageWithSidebar>
    )
  } catch (error) {
    console.error("Error in UploadPage:", error)
    redirect("/auth/login")
  }
}
