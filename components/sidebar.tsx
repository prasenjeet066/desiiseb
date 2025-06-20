"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Home,
  TrendingUp,
  Clock,
  Heart,
  Bookmark,
  Settings,
  Video,
  Music,
  Gamepad2,
  Trophy,
  GraduationCap,
  Tv,
  ChevronDown,
  ChevronRight,
  Bell,
  History,
  PlaySquare,
  Flame,
  Star,
  User,
  X,
  ChevronLeft,
} from "lucide-react"
import { useSidebar } from "./sidebar-context"

interface SidebarProps {
  isOpen: boolean
  onToggle: () => void
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [showAllSubscriptions, setShowAllSubscriptions] = useState(false)
  const [showAllCategories, setShowAllCategories] = useState(false)
  const { isCollapsed, setIsCollapsed } = useSidebar()
  const supabase = createClient()

  useEffect(() => {
    getCurrentUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchSubscriptions()
    }
  }, [user])

  const getCurrentUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchSubscriptions = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select(`
          *,
          profiles!subscriptions_channel_id_fkey(
            id,
            channel_name,
            avatar_url,
            is_verified
          )
        `)
        .eq("subscriber_id", user.id)
        .limit(10)

      if (!error && data) {
        setSubscriptions(data)
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error)
    }
  }

  const mainNavItems = [
    { icon: Home, label: "Home", href: "/", badge: null },
    { icon: TrendingUp, label: "Trending", href: "/trending", badge: "Hot" },
    { icon: Flame, label: "Popular", href: "/popular", badge: null },
    { icon: Clock, label: "Recent", href: "/recent", badge: null },
  ]

  const libraryItems = [
    { icon: History, label: "Watch History", href: "/history", badge: null },
    { icon: Heart, label: "Liked Videos", href: "/liked", badge: null },
    { icon: Bookmark, label: "Saved Videos", href: "/saved", badge: null },
    { icon: PlaySquare, label: "My Videos", href: "/my-videos", badge: null },
    { icon: Video, label: "Upload", href: "/upload", badge: null },
  ]

  const categories = [
    { icon: Music, label: "Music", href: "/category/music" },
    { icon: Gamepad2, label: "Gaming", href: "/category/gaming" },
    { icon: Trophy, label: "Sports", href: "/category/sports" },
    { icon: GraduationCap, label: "Education", href: "/category/education" },
    { icon: Tv, label: "Entertainment", href: "/category/entertainment" },
    { icon: Star, label: "Technology", href: "/category/technology" },
  ]

  const settingsItems = [
    { icon: Settings, label: "Settings", href: "/settings", badge: null },
    { icon: Bell, label: "Notifications", href: "/notifications", badge: "3" },
    { icon: User, label: "Profile", href: "/profile", badge: null },
  ]

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  const NavItem = ({ icon: Icon, label, href, badge }: any) => (
    <Link href={href} onClick={() => onToggle()}>
      <div
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
          isActive(href) ? "bg-white text-black font-medium" : "text-gray-300 hover:bg-gray-800 hover:text-white"
        } ${isCollapsed ? "justify-center px-2" : ""}`}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {!isCollapsed && (
          <>
            <span className="flex-1 truncate">{label}</span>
            {badge && (
              <Badge
                variant={isActive(href) ? "secondary" : "outline"}
                className={`text-xs ${isActive(href) ? "bg-black text-white" : "border-gray-600 text-gray-400"}`}
              >
                {badge}
              </Badge>
            )}
          </>
        )}
        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
            {label}
          </div>
        )}
      </div>
    </Link>
  )

  const SubscriptionItem = ({ subscription }: any) => (
    <Link href={`/channel/${subscription.profiles?.id}`} onClick={() => onToggle()}>
      <div
        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-all duration-200 ${
          isCollapsed ? "justify-center" : ""
        }`}
        title={isCollapsed ? subscription.profiles?.channel_name : ""}
      >
        <div className="relative">
          <img
            src={subscription.profiles?.avatar_url || "/placeholder.svg?height=24&width=24"}
            alt={subscription.profiles?.channel_name}
            className="w-6 h-6 rounded-full"
          />
          {subscription.profiles?.is_verified && (
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>
        {!isCollapsed && <span className="flex-1 truncate text-sm">{subscription.profiles?.channel_name}</span>}
      </div>
    </Link>
  )

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onToggle} />}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-gray-950/95 backdrop-blur-md border-r border-gray-800/50 z-50 transition-all duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:z-auto flex flex-col w-64 lg:${isCollapsed ? "w-20" : "w-64"}`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-4 border-b border-gray-800/50 ${isCollapsed ? "px-2" : ""}`}
        >
          {!isCollapsed ? (
            <Link href="/" className="text-xl font-bold logo-gradient-text" onClick={() => onToggle()}>
              desiiseb
            </Link>
          ) : (
            <div className="w-full flex justify-center">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-sm logo-font">D</span>
              </div>
            </div>
          )}

          {/* Mobile close button */}
          <Button variant="ghost" size="sm" onClick={onToggle} className="lg:hidden text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </Button>

          {/* Desktop collapse button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex text-gray-400 hover:text-white"
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          <div className="p-4 space-y-6">
            {/* Main Navigation */}
            <div className="space-y-1">
              {mainNavItems.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </div>

            {!isCollapsed && <Separator className="bg-gray-800" />}

            {/* Library */}
            <div className="space-y-3">
              {!isCollapsed && (
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-3">Library</h3>
              )}
              <div className="space-y-1">
                {libraryItems.map((item) => (
                  <NavItem key={item.href} {...item} />
                ))}
              </div>
            </div>

            {!isCollapsed && <Separator className="bg-gray-800" />}

            {/* Categories */}
            <div className="space-y-3">
              {!isCollapsed && (
                <div className="flex items-center justify-between px-3">
                  <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Categories</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className="text-gray-400 hover:text-white p-1 h-auto"
                  >
                    {showAllCategories ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  </Button>
                </div>
              )}
              <div className="space-y-1">
                {categories.slice(0, showAllCategories || isCollapsed ? categories.length : 3).map((item) => (
                  <NavItem key={item.href} {...item} />
                ))}
              </div>
            </div>

            {!isCollapsed && <Separator className="bg-gray-800" />}

            {/* Subscriptions */}
            {user && (
              <div className="space-y-3">
                {!isCollapsed && (
                  <div className="flex items-center justify-between px-3">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Subscriptions</h3>
                    {subscriptions.length > 5 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAllSubscriptions(!showAllSubscriptions)}
                        className="text-gray-400 hover:text-white p-1 h-auto"
                      >
                        {showAllSubscriptions ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                )}
                <div className="space-y-1">
                  {subscriptions.length === 0
                    ? !isCollapsed && <p className="text-gray-500 text-sm px-3">No subscriptions yet</p>
                    : subscriptions
                        .slice(0, showAllSubscriptions || isCollapsed ? subscriptions.length : 5)
                        .map((subscription) => <SubscriptionItem key={subscription.id} subscription={subscription} />)}
                </div>
                {subscriptions.length > 0 && !isCollapsed && (
                  <Link href="/subscriptions" onClick={() => onToggle()}>
                    <div className="text-center">
                      <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white text-xs">
                        View all subscriptions
                      </Button>
                    </div>
                  </Link>
                )}
              </div>
            )}

            {!isCollapsed && <Separator className="bg-gray-800" />}

            {/* Settings */}
            <div className="space-y-3">
              {!isCollapsed && (
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider px-3">Account</h3>
              )}
              <div className="space-y-1">
                {settingsItems.map((item) => (
                  <NavItem key={item.href} {...item} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        {!isCollapsed && (
          <div className="p-4 border-t border-gray-800/50">
            <div className="text-xs text-gray-500 space-y-1">
              <p>&copy; 2024 desiiseb</p>
              <p>Video sharing platform</p>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
