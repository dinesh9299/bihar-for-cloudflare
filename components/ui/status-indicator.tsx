"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

interface StatusIndicatorProps {
  status: "online" | "offline" | "maintenance" | "pending" | "completed" | "in-progress"
  size?: "sm" | "md" | "lg"
  showDot?: boolean
  className?: string
}

const statusConfig = {
  online: {
    label: "Online",
    color: "bg-green-500",
    badgeVariant: "default" as const,
    textColor: "text-green-700",
    bgColor: "bg-green-50",
  },
  offline: {
    label: "Offline",
    color: "bg-red-500",
    badgeVariant: "destructive" as const,
    textColor: "text-red-700",
    bgColor: "bg-red-50",
  },
  maintenance: {
    label: "Maintenance",
    color: "bg-yellow-500",
    badgeVariant: "secondary" as const,
    textColor: "text-yellow-700",
    bgColor: "bg-yellow-50",
  },
  pending: {
    label: "Pending",
    color: "bg-orange-500",
    badgeVariant: "outline" as const,
    textColor: "text-orange-700",
    bgColor: "bg-orange-50",
  },
  completed: {
    label: "Completed",
    color: "bg-green-500",
    badgeVariant: "default" as const,
    textColor: "text-green-700",
    bgColor: "bg-green-50",
  },
  "in-progress": {
    label: "In Progress",
    color: "bg-blue-500",
    badgeVariant: "secondary" as const,
    textColor: "text-blue-700",
    bgColor: "bg-blue-50",
  },
}

export function StatusIndicator({ status, size = "md", showDot = true, className }: StatusIndicatorProps) {
  const config = statusConfig[status]

  const dotSize = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  }

  return (
    <Badge
      variant={config.badgeVariant}
      className={cn("flex items-center space-x-2", config.bgColor, config.textColor, className)}
    >
      {showDot && <div className={cn("rounded-full animate-pulse", config.color, dotSize[size])} />}
      <span>{config.label}</span>
    </Badge>
  )
}
