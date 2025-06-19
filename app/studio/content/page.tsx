import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Header from "@/components/header"
import StudioSidebar from "@/components/creator-studio/studio-sidebar"
import StudioContentManager from "@/components/creator-studio/studio-content-manager"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export default async function StudioContentPage() {
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
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white">
        <Header />

        <div className="flex">
          <StudioSidebar />
          <StudioContentManager userId={user.id} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in StudioContentPage:", error)
    redirect("/auth/login")
  }
}
