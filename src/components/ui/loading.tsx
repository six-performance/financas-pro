import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingProps {
  className?: string
  size?: "sm" | "md" | "lg"
  fullscreen?: boolean
}

export function Loading({ className, size = "md", fullscreen = false }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12"
  }

  if (fullscreen) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className={cn("animate-spin text-orange-500", sizeClasses[size], className)} />
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center py-8">
      <Loader2 className={cn("animate-spin text-orange-500", sizeClasses[size], className)} />
    </div>
  )
}

