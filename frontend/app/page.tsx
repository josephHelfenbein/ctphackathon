"use client"

import { useState, useEffect } from "react"
import { MetricCard } from "./components/metric-card"
import { LiveChart } from "./components/live-chart"
import { CameraFeed } from "./components/camera-feed"
import { StatusIndicator } from "./components/status-indicator"
import { ProgressBar } from "./components/progress-bar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Brain, Zap, Activity, Play, Pause, RotateCcw } from "lucide-react"

// Mock data generation for demonstration
const generateMockData = () => ({
  stressLevel: Math.random() * 100,
  breathingRate: 12 + Math.random() * 8,
  confidenceLevel: 70 + Math.random() * 30,
  heartRate: 60 + Math.random() * 40,
})

export default function StressDashboard() {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [currentMetrics, setCurrentMetrics] = useState(generateMockData())
  // const [chartData, setChartData] = useState({
  //   stress: [] as Array<{ time: string; value: number }>,
  //   breathing: [] as Array<{ time: string; value: number }>,
  //   confidence: [] as Array<{ time: string; value: number }>,
  // })

  // Simulate real-time data updates
  useEffect(() => {
    if (!isMonitoring) return

    const interval = setInterval(() => {
      const newMetrics = generateMockData()
      setCurrentMetrics(newMetrics)

      const currentTime = new Date().toLocaleTimeString()

      // setChartData((prev) => ({
      //   stress: [...prev.stress.slice(-19), { time: currentTime, value: newMetrics.stressLevel }],
      //   breathing: [...prev.breathing.slice(-19), { time: currentTime, value: newMetrics.breathingRate }],
      //   confidence: [...prev.confidence.slice(-19), { time: currentTime, value: newMetrics.confidenceLevel }],
      // }))
    }, 2000)

    return () => clearInterval(interval)
  }, [isMonitoring])

  const getStressStatus = (level: number) => {
    if (level < 20) return "excellent"
    if (level < 40) return "good"
    if (level < 60) return "moderate"
    if (level < 80) return "poor"
    return "critical"
  }

  const getBreathingStatus = (rate: number) => {
    if (rate >= 12 && rate <= 16) return "excellent"
    if (rate >= 10 && rate <= 18) return "good"
    if (rate >= 8 && rate <= 20) return "moderate"
    return "poor"
  }

  const handleStartMonitoring = () => {
    setIsMonitoring(true)
    // Initialize with some data points
    const initialTime = new Date().toLocaleTimeString()
    const initialMetrics = generateMockData()
    // setChartData({
    //   stress: [{ time: initialTime, value: initialMetrics.stressLevel }],
    //   breathing: [{ time: initialTime, value: initialMetrics.breathingRate }],
    //   confidence: [{ time: initialTime, value: initialMetrics.confidenceLevel }],
    // })
  }

  const handleStopMonitoring = () => {
    setIsMonitoring(false)
  }

  const handleReset = () => {
    setIsMonitoring(false)
    // setChartData({ stress: [], breathing: [], confidence: [] })
    setCurrentMetrics(generateMockData())
  }

  return (
    <div className="min-h-screen bg-background p-10 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stress & Anxiety Monitor</h1>
          <p className="text-muted-foreground">Real-time biometric analysis dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={isMonitoring ? "default" : "secondary"} className="px-3 py-1">
            {isMonitoring ? "MONITORING" : "STANDBY"}
          </Badge>
        </div>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Control Panel
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Button
            onClick={isMonitoring ? handleStopMonitoring : handleStartMonitoring}
            variant={isMonitoring ? "destructive" : "default"}
            className="flex items-center gap-2"
          >
            {isMonitoring ? (
              <>
                <Pause className="h-4 w-4" />
                Stop Monitoring
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Start Monitoring
              </>
            )}
          </Button>
          <Button onClick={handleReset} variant="outline" className="flex items-center gap-2 bg-transparent">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Camera Feed */}
        <div className="lg:col-span-1">
          <CameraFeed />
        </div>

        {/* Metrics Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <MetricCard
              title="Stress Level"
              value={currentMetrics.stressLevel}
              status={
                currentMetrics.stressLevel < 30
                  ? "low"
                  : currentMetrics.stressLevel < 60
                    ? "normal"
                    : currentMetrics.stressLevel < 80
                      ? "high"
                      : "critical"
              }
              icon={<Brain className="h-4 w-4" />}
            />
            <MetricCard
              title="Breathing Rate"
              value={currentMetrics.breathingRate}
              unit=" bpm"
              status={currentMetrics.breathingRate >= 12 && currentMetrics.breathingRate <= 16 ? "normal" : "high"}
              icon={<Activity className="h-4 w-4" />}
            />
            <MetricCard
              title="Confidence Level"
              value={currentMetrics.confidenceLevel}
              status={currentMetrics.confidenceLevel > 80 ? "normal" : "low"}
              icon={<Zap className="h-4 w-4" />}
            />
            <MetricCard
              title="Heart Rate"
              value={currentMetrics.heartRate}
              unit=" bpm"
              status={currentMetrics.heartRate >= 60 && currentMetrics.heartRate <= 80 ? "normal" : "high"}
              icon={<Heart className="h-4 w-4" />}
            />
          </div>

          {/* Status Indicators */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Status</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatusIndicator status={getStressStatus(currentMetrics.stressLevel)} label="Stress Level" />
              <StatusIndicator status={getBreathingStatus(currentMetrics.breathingRate)} label="Breathing Pattern" />
              <StatusIndicator
                status={
                  currentMetrics.confidenceLevel > 80
                    ? "excellent"
                    : currentMetrics.confidenceLevel > 60
                      ? "good"
                      : "moderate"
                }
                label="Analysis Confidence"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Live Charts
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <LiveChart title="Stress Level Trend" data={chartData.stress} color="chart-1" yAxisDomain={[0, 100]} />
        <LiveChart title="Breathing Rate" data={chartData.breathing} color="chart-2" yAxisDomain={[8, 24]} />
        <LiveChart title="Confidence Level" data={chartData.confidence} color="chart-3" yAxisDomain={[0, 100]} />
      </div> */}

      {/* Progress Bars Section */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ProgressBar
            label="Stress Level"
            value={currentMetrics.stressLevel}
            color={currentMetrics.stressLevel < 50 ? "success" : currentMetrics.stressLevel < 75 ? "warning" : "danger"}
          />
          <ProgressBar
            label="Breathing Stability"
            value={Math.max(0, 100 - Math.abs(currentMetrics.breathingRate - 14) * 10)}
            color="primary"
          />
          <ProgressBar label="Analysis Confidence" value={currentMetrics.confidenceLevel} color="secondary" />
        </CardContent>
      </Card>
    </div>
  )
}