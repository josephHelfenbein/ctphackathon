import { cn } from "@/lib/utils"
import { AlertTriangle, CheckCircle, AlertCircle, XCircle } from "lucide-react"

interface StatusIndicatorProps {
  status: "excellent" | "good" | "moderate" | "poor" | "critical"
  label: string
  className?: string
}

const statusConfig = {
  excellent: {
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
    icon: CheckCircle,
    text: "Excellent",
  },
  good: {
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
    icon: CheckCircle,
    text: "Good",
  },
  moderate: {
    color: "text-chart-2",
    bgColor: "bg-chart-2/10",
    icon: AlertCircle,
    text: "Moderate",
  },
  poor: {
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    icon: AlertTriangle,
    text: "Poor",
  },
  critical: {
    color: "text-destructive",
    bgColor: "bg-destructive/20",
    icon: XCircle,
    text: "Critical",
  },
}

export function StatusIndicator({ status, label, className }: StatusIndicatorProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200",
        config.bgColor,
        className,
      )}
    >
      <Icon className={cn("h-4 w-4", config.color)} />
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={cn("text-sm font-medium", config.color)}>{config.text}</span>
      </div>
    </div>
  )
}
