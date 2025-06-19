"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Eye, Users, ThumbsUp, Video } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  change?: string
  trend?: "up" | "down"
  icon: React.ReactNode
}

interface DashboardStatsProps {
  totalViews: number
  subscribers: number
  totalVideos: number
  totalLikes: number
}

function StatCard({ title, value, change, trend, icon }: StatCardProps) {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
        <div className="text-gray-400">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        {change && trend && (
          <div className={`text-xs flex items-center gap-1 ${trend === "up" ? "text-green-400" : "text-red-400"}`}>
            {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {change}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function formatNumber(num: number): string {
  if (num < 1000) return num.toString()
  if (num < 1000000) return `${(num / 1000).toFixed(1)}K`
  return `${(num / 1000000).toFixed(1)}M`
}

export default function DashboardStats({ totalViews, subscribers, totalVideos, totalLikes }: DashboardStatsProps) {
  const stats = [
    {
      title: "Total Views",
      value: formatNumber(totalViews),
      icon: <Eye className="w-4 h-4" />,
    },
    {
      title: "Subscribers",
      value: formatNumber(subscribers),
      icon: <Users className="w-4 h-4" />,
    },
    {
      title: "Total Videos",
      value: totalVideos.toString(),
      icon: <Video className="w-4 h-4" />,
    },
    {
      title: "Total Likes",
      value: formatNumber(totalLikes),
      icon: <ThumbsUp className="w-4 h-4" />,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  )
}
