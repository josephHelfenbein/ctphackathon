import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: number
  unit?: string
  status: "low" | "normal" | "high" | "critical"
  icon?: React.ReactNode
  className?: string
}

const statusColors = {
  low: "text-chart-3",
  normal: "text-chart-1",
  high: "text-chart-2",
  critical: "text-destructive",
}

const statusBgColors = {
  low: "bg-chart-3/10",
  normal: "bg-chart-1/10",
  high: "bg-chart-2/10",
  critical: "bg-destructive/10",
}

export function MetricCard({ title, value, unit = "%", status, icon, className }: MetricCardProps) {
  return (
    <Card className={cn("transition-all duration-200 hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2">
          <div className="text-2xl font-bold">
            {value.toFixed(1)}
            {unit}
          </div>
          <div
            className={cn("px-2 py-1 rounded-full text-xs font-medium", statusColors[status], statusBgColors[status])}
          >
            {status.toUpperCase()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
