// import React from "react"
// import { cn } from "@/lib/utils"

// interface GradientBarProps {
//   label: string
//   value: number // percentage value 0–100
//   colorFrom: string // e.g. "from-green-400"
//   colorTo: string   // e.g. "to-red-500"
// }

// export function GradientBar({ label, value, colorFrom, colorTo }: GradientBarProps) {
//   return (
//     <div className="space-y-2">
//       <div className="flex justify-between text-sm font-medium text-muted-foreground">
//         <span>{label}</span>
//         <span>{value}%</span>
//       </div>
//       <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
//         <div
//           className={cn(
//             "h-4 rounded-full transition-all duration-500 bg-gradient-to-r",
//             colorFrom,
//             colorTo
//           )}
//           style={{ width: `${value}%` }}
//         />
//       </div>
//     </div>
//   )
// }

import React from "react"

interface GradientBarProps {
  label: string
  value: number // 0–100
}

export function GradientBar({ label, value }: GradientBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-medium text-muted-foreground">
        <span>{label}</span>
        <span>{value.toFixed(1)}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-4 relative overflow-hidden">
        {/* Static gradient background */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 to-red-500" />
        
        {/* Dynamic "mask" that reveals part of the gradient */}
        <div
          className="absolute inset-0 bg-white/90 transition-all"
          style={{ left: `${value}%` }}
        />
      </div>
    </div>
  )
}
