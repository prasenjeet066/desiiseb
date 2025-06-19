import Link from "next/link"
import { Button } from "@/components/ui/button"
import { VideoOff, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center space-y-6">
        <VideoOff className="w-24 h-24 text-gray-600 mx-auto" />
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Video Not Found</h1>
          <p className="text-gray-400 text-lg">The video you're looking for doesn't exist or has been removed.</p>
        </div>
        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button className="bg-white text-black hover:bg-gray-200">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
