"use client"

import type React from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, X, LogIn, UserPlus } from "lucide-react"

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
          isSearchFocused ? "ring-2 ring-primary/20 scale-[1.02]" : ""
        } rounded-full bg-muted/80 backdrop-blur-sm border border-border hover:border-border/60`}
      >
        <Input
          type="text"
          placeholder="Search videos, channels..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className="flex-1 bg-transparent border-0 text-foreground placeholder-muted-foreground focus:ring-0 rounded-l-full pl-4 pr-10 h-11"
        />

        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-12 text-muted-foreground hover:text-foreground p-1 h-auto"
          >
            <X className="w-4 h-4" />
          </Button>
        )}

        <Button
          type="submit"
          variant="ghost"
          size="sm"
          className="rounded-r-full px-4 py-2 text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <Search className="w-4 h-4" />
        </Button>
      </div>
    </form>
  )
}

export default function PublicHeader() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur-md sticky top-0 z-40 transition-all duration-300">
      <div className="container mx-auto px-4 py-3 flex items-center gap-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-2xl font-bold logo-gradient-text flex-shrink-0 hover:scale-105 transition-transform duration-200"
        >
          desiiseb
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-4">
          <Suspense fallback={<div className="h-11 bg-muted/80 rounded-full border border-border animate-pulse" />}>
            <SearchComponent />
          </Suspense>
        </div>

        {/* Auth Buttons */}
        <nav className="flex items-center space-x-2 flex-shrink-0">
          <Link href="/auth/login">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-full"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Sign In
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full">
              <UserPlus className="w-4 h-4 mr-2" />
              Sign Up
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  )
}
