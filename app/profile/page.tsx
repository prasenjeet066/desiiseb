import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import EnhancedUserProfile from "@/components/enhanced-user-profile"
import PageWithSidebar from "@/components/page-with-sidebar"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export default async function ProfilePage() {
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
        <div className="container mx-auto px-4 py-8">
          <EnhancedUserProfile user={user} />
        </div>
      </PageWithSidebar>
    )
  } catch (error) {
    console.error("Error in ProfilePage:", error)
    redirect("/auth/login")
  }
}
