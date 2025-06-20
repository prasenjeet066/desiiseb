import { cn } from "@/lib/utils"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn("animate-spin rounded-full border-2 border-gray-300 border-t-blue-600", sizeClasses[size])} />
    </div>
  )
}

export function PageLoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="text-center space-y-4">
        <LoadingSpinner size="xl" />
        <p className="text-gray-400 text-lg">Loading...</p>
      </div>
    </div>
  )
}

export function CardLoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center space-y-3">
        <LoadingSpinner size="lg" />
        <p className="text-gray-500 text-sm">Loading content...</p>
      </div>
    </div>
  )
}
