"use client"

import type React from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, Suspense, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, Home, Search, X, Menu, Bell, Settings, LogOut, User, BarChart3 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface HeaderProps {
  onSidebarToggle?: () => void
  showSidebarToggle?: boolean
}

function SearchComponent() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchFocused, setIsSearchFocused] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const clearSearch = () => {
    setSearchQuery("")
    setIsSearchFocused(false)
  }

  return (
    <form onSubmit={handleSearch} className="relative group">
      <div
        className={`relative flex items-center transition-all duration-300 ${
          isSearchFocused ? "ring-2 ring-white/20 scale-[1.02]" : ""
        } rounded-full bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 hover:border-gray-600`}
      >
        <Input
          type="text"
          placeholder="Search videos, channels..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className="flex-1 bg-transparent border-0 text-white placeholder-gray-400 focus:ring-0 rounded-l-full pl-4 pr-10 h-11"
        />

        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-12 text-gray-400 hover:text-white p-1 h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        )}

        <Button
          type="submit"
          variant="ghost"
          size="sm"
          className="rounded-r-full px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>
    </form>
  )
}

function UserAvatar() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        // Fetch user profile
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
        setProfile(profile)
      }
    }
    getUser()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  if (!user) return null

  const displayName = profile?.display_name || profile?.channel_name || user?.user_metadata?.username || "User"
  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
          <Avatar className="h-9 w-9">
            <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={displayName} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-gray-900 border-gray-700" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={displayName} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium text-white">{displayName}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-gray-800">
          <Link href="/profile" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            Your Channel
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-gray-800">
          <Link href="/studio" className="flex items-center">
            <BarChart3 className="mr-2 h-4 w-4" />
            Creator Studio
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="text-gray-300 hover:text-white hover:bg-gray-800">
          <Link href="/settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem onClick={handleSignOut} className="text-red-400 hover:text-red-300 hover:bg-red-900/20">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function Header({ onSidebarToggle, showSidebarToggle = true }: HeaderProps) {
  const [notificationCount, setNotificationCount] = useState(3) // Mock notification count

  return (
    <header className="border-b border-gray-800/50 bg-black/95 backdrop-blur-md sticky top-0 z-40 transition-all duration-300">
      <div className="container mx-auto px-4 py-3 flex items-center gap-4">
        {/* Sidebar Toggle & Logo */}
        <div className="flex items-center gap-3">
          {showSidebarToggle && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSidebarToggle}
              className="text-gray-400 hover:text-white p-2 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}

          <Link
            href="/"
            className="text-2xl font-bold logo-gradient-text flex-shrink-0 hover:scale-105 transition-transform duration-200"
          >
            desiiseb
          </Link>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-4">
          <Suspense
            fallback={<div className="h-11 bg-gray-900/80 rounded-full border border-gray-700/50 animate-pulse" />}
          >
            <SearchComponent />
          </Suspense>
        </div>

        {/* Navigation */}
        <nav className="flex items-center space-x-2 flex-shrink-0">
          <Link href="/">
            <Button variant="ghost" size="sm" className="nav-link">
              <Home className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/upload">
            <Button variant="ghost" size="sm" className="nav-link">
              <Upload className="w-5 h-5" />
            </Button>
          </Link>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="nav-link relative">
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </Button>

          {/* User Avatar */}
          <UserAvatar />
        </nav>
      </div>
    </header>
  )
}
