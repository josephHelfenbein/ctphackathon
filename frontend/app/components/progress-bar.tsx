import { cn } from "@/lib/utils"

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  color?: "primary" | "secondary" | "success" | "warning" | "danger"
  size?: "sm" | "md" | "lg"
  showValue?: boolean
  className?: string
}

const colorClasses = {
  primary: "bg-chart-1",
  secondary: "bg-chart-2",
  success: "bg-chart-3",
  warning: "bg-chart-2",
  danger: "bg-destructive",
}

const sizeClasses = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
}

export function ProgressBar({
  value,
  max = 100,
  label,
  color = "primary",
  size = "md",
  showValue = true,
  className,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className={cn("w-full", className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium">{label}</span>}
          {showValue && (
            <span className="text-sm text-muted-foreground">
              {value.toFixed(1)}/{max}
            </span>
          )}
        </div>
      )}
      <div className={cn("w-full bg-muted rounded-full overflow-hidden", sizeClasses[size])}>
        <div
          className={cn("h-full transition-all duration-300 ease-out rounded-full", colorClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
