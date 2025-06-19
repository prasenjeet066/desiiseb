import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import EditProfileForm from "@/components/edit-profile-form"
import PageWithSidebar from "@/components/page-with-sidebar"

export const dynamic = "force-dynamic"

export default async function EditProfilePage() {
  try {
    const supabase = createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      redirect("/auth/login")
    }

    // Fetch user profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    return (
      <PageWithSidebar>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Edit Profile</h1>
              <p className="text-gray-400">Update your profile information and customize your channel</p>
            </div>
            <EditProfileForm user={user} profile={profile} />
          </div>
        </div>
      </PageWithSidebar>
    )
  } catch (error) {
    console.error("Error in EditProfilePage:", error)
    redirect("/auth/login")
  }
}
