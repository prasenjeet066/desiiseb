"use client"

import type React from "react"
import { useState } from "react"
import Header from "./header"
import Sidebar from "./sidebar"
import Footer from "./footer"
import { SidebarProvider, useSidebar } from "./sidebar-context"

interface PageWithSidebarProps {
  children: React.ReactNode
  showFooter?: boolean
}

function PageContent({ children, showFooter }: PageWithSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isCollapsed } = useSidebar()

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Main Content - adjust margin based on sidebar state */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-300 ${isCollapsed ? "lg:ml-20" : "lg:ml-64"}`}
      >
        {/* Header with Sidebar Toggle */}
        <Header onSidebarToggle={toggleSidebar} showSidebarToggle={true} />

        {/* Page Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        {showFooter && <Footer />}
      </div>
    </div>
  )
}

export default function PageWithSidebar({ children, showFooter = true }: PageWithSidebarProps) {
  return (
    <SidebarProvider>
      <PageContent showFooter={showFooter}>{children}</PageContent>
    </SidebarProvider>
  )
}
