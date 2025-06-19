import { createClient } from "@/utils/supabase/server"
import SearchResults from "@/components/search-results"
import PageWithSidebar from "@/components/page-with-sidebar"
import PublicHeader from "@/components/public-header"

// Force dynamic rendering
export const dynamic = "force-dynamic"

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
  }>
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  try {
    const supabase = createClient()
    let user = null

    if (supabase) {
      try {
        const { data } = await supabase.auth.getUser()
        user = data?.user || null
      } catch (error) {
        console.log("No authenticated user")
      }
    }

    const params = await searchParams
    const query = params.q || ""

    // Show different layout based on authentication status
    if (user) {
      return (
        <PageWithSidebar>
          <div className="container mx-auto px-4 py-8">
            <SearchResults query={query} />
          </div>
        </PageWithSidebar>
      )
    }

    // Public view for unauthenticated users
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white">
        <PublicHeader />
        <div className="container mx-auto px-4 py-8">
          <SearchResults query={query} />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in SearchPage:", error)
    return (
      <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white">
        <PublicHeader />
        <div className="container mx-auto px-4 py-8">
          <SearchResults query="" />
        </div>
      </div>
    )
  }
}
