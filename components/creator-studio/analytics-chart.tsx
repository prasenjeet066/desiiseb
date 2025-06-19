"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface AnalyticsChartProps {
  userId: string
}

interface ChartData {
  name: string
  views: number
  videos: number
}

export default function AnalyticsChart({ userId }: AnalyticsChartProps) {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchAnalyticsData()
  }, [userId])

  const fetchAnalyticsData = async () => {
    try {
      // Fetch videos from the last 6 months
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

      const { data: videos, error } = await supabase
        .from("video")
        .select("views, uploaded_at")
        .eq("channel_id", userId)
        .gte("uploaded_at", sixMonthsAgo.toISOString())

      if (error) throw error

      // Group data by month
      const monthlyData: Record<string, { views: number; videos: number }> = {}

      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthKey = date.toLocaleDateString("en-US", { month: "short" })
        monthlyData[monthKey] = { views: 0, videos: 0 }
      }

      // Aggregate video data
      videos?.forEach((video) => {
        const date = new Date(video.uploaded_at)
        const monthKey = date.toLocaleDateString("en-US", { month: "short" })

        if (monthlyData[monthKey]) {
          monthlyData[monthKey].views += video.views || 0
          monthlyData[monthKey].videos += 1
        }
      })

      // Convert to chart format
      const chartData = Object.entries(monthlyData).map(([name, data]) => ({
        name,
        views: data.views,
        videos: data.videos,
      }))

      setData(chartData)
    } catch (error) {
      console.error("Error fetching analytics data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">Channel Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="skeleton w-full h-full rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Channel Analytics (Last 6 Months)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#F3F4F6",
                }}
              />
              <Line type="monotone" dataKey="views" stroke="#EF4444" strokeWidth={2} name="Views" />
              <Line type="monotone" dataKey="videos" stroke="#10B981" strokeWidth={2} name="Videos Uploaded" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
