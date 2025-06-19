"use client"

import type React from "react"

import { useState } from "react"
import Sidebar from "./sidebar"
import Footer from "./footer"

interface LayoutWrapperProps {
  children: React.ReactNode
  showSidebar?: boolean
  showFooter?: boolean
}

export default function LayoutWrapper({ children, showSidebar = true, showFooter = true }: LayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-950 to-black text-white flex">
      {/* Sidebar */}
      {showSidebar && <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />}

      {/* Main Content */}
      <div className={`flex-1 flex flex-col ${showSidebar ? "lg:ml-0" : ""}`}>
        {/* Page Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        {showFooter && <Footer />}
      </div>
    </div>
  )
}
