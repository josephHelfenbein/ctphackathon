"use client"

import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface LiveChartProps {
  title: string
  data: Array<{ time: string; value: number }>
  color: string
  yAxisDomain?: [number, number]
  className?: string
}

export function LiveChart({ title, data, color, yAxisDomain = [0, 100], className }: LiveChartProps) {
  const chartConfig = {
    value: {
      label: title,
      color: `hsl(var(--${color}))`,
    },
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis domain={yAxisDomain} axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={`hsl(var(--${color}))`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: `hsl(var(--${color}))`, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
