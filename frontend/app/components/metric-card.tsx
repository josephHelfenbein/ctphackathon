import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// interface MetricCardProps {
//   title: string
//   value: number
//   unit?: string
//   status: "low" | "normal" | "high" | "critical"
//   icon?: React.ReactNode
//   className?: string
// }

interface MetricCardProps {
  title: string
  value: number
  unit?: string
  status: "low" | "normal" | "high" | "critical"
  icon?: React.ReactNode
  variant: "stress" | "breathing" | "confidence" | "heart"
}

// const statusColors = {
//   low: "text-chart-3",
//   normal: "text-chart-1",
//   high: "text-chart-2",
//   critical: "text-destructive",
// }

// const statusBgColors = {
//   low: "bg-chart-3/10",
//   normal: "bg-chart-1/10",
//   high: "bg-chart-2/10",
//   critical: "bg-destructive/10",
// }

const gradientMap = {
  stress: "bg-gradient-to-br from-purple-700 via-purple-500 to-purple-300",
  breathing: "bg-gradient-to-br from-blue-700 via-blue-500 to-blue-300",
  confidence: "bg-gradient-to-br from-amber-700 via-amber-500 to-amber-300",
  heart: "bg-gradient-to-br from-red-700 via-red-500 to-red-300",
}

// export function MetricCard({ title, value, unit = "%", status, icon, className }: MetricCardProps) {
//   return (
//     <Card className={cn("transition-all duration-200 hover:shadow-md", className)}>
//       <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//         <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
//         {icon && <div className="text-muted-foreground">{icon}</div>}
//       </CardHeader>
//       <CardContent>
//         <div className="flex items-center space-x-2">
//           <div className="text-2xl font-bold">
//             {value.toFixed(1)}
//             {unit}
//           </div>
//           <div
//             className={cn("px-2 py-1 rounded-full text-xs font-medium", statusColors[status], statusBgColors[status])}
//           >
//             {status.toUpperCase()}
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

export function MetricCard({
  title,
  value,
  unit,
  status,
  icon,
  variant,
}: MetricCardProps) {
  return (
    <Card
      className={cn(
        "text-white shadow-lg rounded-2xl overflow-hidden",
        gradientMap[variant]
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-semibold">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold pb-1">
          {value.toFixed(1)}
          {unit}
        </div>
        <div
          // className={cn("px-2 py-1 rounded-full text-xs font-medium", statusColors[status], statusBgColors[status])}
          className={cn("px-0 py-0 rounded-full text-xs font-medium text-white")}
        >
          {status.toUpperCase()}
        </div>
      </CardContent>
    </Card>
  )
}
