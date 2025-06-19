"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  Video,
  MessageSquare,
  DollarSign,
  Settings,
  TrendingUp,
  FileText,
  Palette,
  Home,
} from "lucide-react"

const studioNavItems = [
  {
    title: "Dashboard",
    href: "/studio",
    icon: BarChart3,
  },
  {
    title: "Content",
    href: "/studio/content",
    icon: Video,
    children: [
      { title: "Videos", href: "/studio/content/videos", icon: Video },
      { title: "Shorts", href: "/studio/content/shorts", icon: Video },
      { title: "Live", href: "/studio/content/live", icon: Video },
      { title: "Playlists", href: "/studio/content/playlists", icon: FileText },
    ],
  },
  {
    title: "Analytics",
    href: "/studio/analytics",
    icon: TrendingUp,
  },
  {
    title: "Comments",
    href: "/studio/comments",
    icon: MessageSquare,
  },
  {
    title: "Monetization",
    href: "/studio/monetization",
    icon: DollarSign,
  },
  {
    title: "Customization",
    href: "/studio/customization",
    icon: Palette,
  },
  {
    title: "Settings",
    href: "/studio/settings",
    icon: Settings,
  },
]

export default function StudioSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-gray-900 border-r border-gray-800 h-screen overflow-y-auto">
      <div className="p-4">
        <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white mb-6">
          <Home className="w-4 h-4" />
          <span className="text-sm">Back to desiiseb</span>
        </Link>

        <h2 className="text-lg font-semibold text-white mb-4">Creator Studio</h2>

        <nav className="space-y-1">
          {studioNavItems.map((item) => (
            <div key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                  pathname === item.href ? "bg-red-600 text-white" : "text-gray-300 hover:text-white hover:bg-gray-800",
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.title}
              </Link>

              {item.children && pathname.startsWith(item.href) && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                        pathname === child.href
                          ? "bg-red-600 text-white"
                          : "text-gray-400 hover:text-white hover:bg-gray-800",
                      )}
                    >
                      <child.icon className="w-3 h-3" />
                      {child.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </div>
  )
}
