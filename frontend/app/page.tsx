"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { MetricCard } from "./components/metric-card"
import { LiveChart } from "./components/live-chart"
import { StatusIndicator } from "./components/status-indicator"
import { ProgressBar } from "./components/progress-bar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Brain, Zap, Activity, Play, Pause, RotateCcw, Camera, CameraOff } from "lucide-react"
import { GradientBar } from "./components/gradient-bar"
import { NavBar } from "./components/NavBar"

type WsMsg = { type: string; payload?: any };

// Agent connection status type
type AgentStatus = "idle" | "fetching-ws-url" | "ws-connecting" | "ws-open" | "webrtc-connected" | "ws-closed" | "ws-error" | string;

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
  const [cameraConnected, setCameraConnected] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  
  // Agent connection state
  const [agentStatus, setAgentStatus] = useState<AgentStatus>("idle")
  const [wsUrl, setWsUrl] = useState<string>("")
  const [realTimeData, setRealTimeData] = useState<any>(null)
  
  // WebRTC and WebSocket refs
  const videoRef = useRef<HTMLVideoElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)

  // Start camera function (separate from monitoring)
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraStream(stream);
        setCameraConnected(true);
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraConnected(false);
    }
  }, []);

  // Stop camera function
  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraStream(null);
    setCameraConnected(false);
  }, [cameraStream]);

  // Agent connection function (now uses existing camera stream)
  const connectToAgent = useCallback(async () => {
    if (!cameraConnected || !cameraStream) {
      console.error("Camera must be started before connecting to agent");
      return;
    }

    setAgentStatus("fetching-ws-url");
    try {
      const resp = await fetch("/api/ws-url");
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || "Failed to get WS URL");
      setWsUrl(data.wsUrl as string);
      const ws = new WebSocket(data.wsUrl as string);
      wsRef.current = ws;
      setAgentStatus("ws-connecting");

      ws.onopen = async () => {
        setAgentStatus("ws-open");
        
        // Setup WebRTC after WebSocket is open
        const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
        pcRef.current = pc;
        cameraStream.getTracks().forEach((t) => pc.addTrack(t, cameraStream));

        pc.onicecandidate = (ev) => {
          if (ev.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
            const msg: WsMsg = { type: "webrtc.candidate", payload: ev.candidate.toJSON() };
            wsRef.current.send(JSON.stringify(msg));
          }
        };

        // Create and send offer after WebSocket is ready
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        const offerMsg: WsMsg = { type: "webrtc.offer", payload: offer };
        ws.send(JSON.stringify(offerMsg));
        console.log("📤 Sent WebRTC offer to server");
        
        // Start the agent
        ws.send(JSON.stringify({ type: "control.start", payload: {} } satisfies WsMsg));
      };

      ws.onmessage = async (e) => {
        const msg: WsMsg = JSON.parse(e.data);
        if (msg.type === "webrtc.answer") {
          const pc = pcRef.current;
          if (!pc) return;
          await pc.setRemoteDescription(new RTCSessionDescription(msg.payload));
          setAgentStatus("webrtc-connected");
        } else if (msg.type?.startsWith("logs.")) {
          console.log("Agent log:", msg.payload?.message);
        } else if (msg.type === "ml_data") {
          // Handle real-time ML data from the agent
          setRealTimeData(msg.payload);
          if (msg.payload) {
            // Update current metrics with real data
            setCurrentMetrics({
              stressLevel: msg.payload.stress_level || currentMetrics.stressLevel,
              breathingRate: msg.payload.breathing_rate || currentMetrics.breathingRate,
              confidenceLevel: msg.payload.confidence || currentMetrics.confidenceLevel,
              heartRate: msg.payload.heart_rate || currentMetrics.heartRate,
            });
          }
        }
      };
      
      ws.onclose = () => {
        setAgentStatus("ws-closed");
        setIsMonitoring(false);
      };
      
      ws.onerror = () => {
        setAgentStatus("ws-error");
        setIsMonitoring(false);
      };

    } catch (err: any) {
      console.error("Agent connection error:", err);
      setAgentStatus("error: " + err?.message);
    }
  }, [cameraConnected, cameraStream, currentMetrics]);

  // Disconnect from agent
  const disconnectFromAgent = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (pcRef.current) {
      pcRef.current.close();
    }
    setAgentStatus("idle");
    setRealTimeData(null);
  }, []);;

  // const [chartData, setChartData] = useState({
  //   stress: [] as Array<{ time: string; value: number }>,
  //   breathing: [] as Array<{ time: string; value: number }>,
  //   confidence: [] as Array<{ time: string; value: number }>,
  // })

  // Simulate real-time data updates (fallback when not connected to agent)
  useEffect(() => {
    if (!isMonitoring || agentStatus === "webrtc-connected") return // Use real data when connected

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
  }, [isMonitoring, agentStatus])

  useEffect(() => {
    if (!cameraConnected && isMonitoring) {
      // Camera stopped while monitoring
      handleStopMonitoring()
    }
  }, [cameraConnected, isMonitoring])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (pcRef.current) {
        pcRef.current.close();
      }
    };
  }, [cameraStream]);



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

  const handleStartMonitoring = async () => {
    if (!cameraConnected) {
      console.error("Camera must be started before monitoring");
      return;
    }
    if (agentStatus === "idle") {
      // Connect to agent first
      await connectToAgent();
    }
    setIsMonitoring(true);
  }

  const handleStopMonitoring = () => {
    setIsMonitoring(false)
    disconnectFromAgent()
  }

  const handleReset = () => {
    setIsMonitoring(false)
    disconnectFromAgent()
    // setChartData({ stress: [], breathing: [], confidence: [] })
    setCurrentMetrics(generateMockData())
  }


  return (
    <>
      <nav className="sticky top-0 left-0 w-full bg-background border-b border-border z-50 px-10 py-4 flex flex-wrap items-center justify-between gap-1">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Stress & Anxiety Monitor</h1>
          <p className="text-sm text-muted-foreground">Real-time biometric analysis dashboard</p>
        </div>


        <div className="flex justify-end gap-4">
          
          {/* Camera Status Indicator */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Camera:</span>
            <span
              className={`
                h-2 w-2 rounded-full 
                ${cameraConnected ? "bg-green-500" : "bg-gray-500"}
              `}
            />
            <span className="font-sm text-xs">
              {cameraConnected ? "ACTIVE" : "INACTIVE"}
            </span>
          </div>
          
          {/* Agent Status Indicator */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Agent:</span>
            <span
              className={`
                h-2 w-2 rounded-full 
                ${agentStatus === "webrtc-connected" ? "bg-green-500 animate-pulse" : 
                  agentStatus === "ws-open" || agentStatus === "ws-connecting" ? "bg-yellow-500" :
                  agentStatus.startsWith("error") || agentStatus === "ws-error" ? "bg-red-500" : "bg-gray-500"}
              `}
            />
            <span className="font-sm text-xs">
              {agentStatus === "webrtc-connected" ? "CONNECTED" :
               agentStatus === "ws-open" ? "WEBSOCKET" :
               agentStatus === "ws-connecting" ? "CONNECTING" :
               agentStatus.startsWith("error") ? "ERROR" :
               agentStatus === "ws-error" ? "ERROR" :
               "DISCONNECTED"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`
                h-2 w-2 rounded-full 
                ${isMonitoring ? "bg-green-500 animate-pulse" : "bg-red-500"}
              `}
            />
            <span className="font-sm text-sm">
              {isMonitoring ? "MONITORING" : "STANDBY"}
            </span>
          </div>

         
          {/* <Badge
            variant={isMonitoring ? "default" : "secondary"}
            className="px-3 py-1"
          >
            {isMonitoring ? "MONITORING" : "STANDBY"}
          </Badge> */}



          {/* Monitoring Control Button */}
          <Button
            onClick={isMonitoring ? handleStopMonitoring : handleStartMonitoring}
            variant={isMonitoring ? "destructive" : "default"}
            className="flex items-center gap-2"
            disabled={!cameraConnected || agentStatus === "ws-connecting" || agentStatus === "fetching-ws-url"}
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
        </div>

      </nav>




      <div className="min-h-screen bg-background p-10 space-y-6">

        {/* Header */}
        {/* <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Stress & Anxiety Monitor</h1>
          <p className="text-muted-foreground">Real-time biometric analysis dashboard</p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={isMonitoring ? "default" : "secondary"} className="px-3 py-1">
            {isMonitoring ? "MONITORING" : "STANDBY"}
          </Badge>
        </div>
      </div> */}







        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Camera Feed */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                <CardTitle>Live Video Feed</CardTitle>
                 {/* Camera Control Button */}
                <Button
                  onClick={cameraConnected ? stopCamera : startCamera}
                  variant={cameraConnected ? "outline" : "secondary"}
                  className="flex items-center gap-2"
                >
                  {cameraConnected ? (
                    <>
                      <CameraOff className="h-4 w-4" />
                      Stop Camera
                    </>
                  ) : (
                    <>
                      <Camera className="h-4 w-4" />
                      Start Camera
                    </>
                  )}
                </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full rounded border aspect-video bg-gray-100"
                  />
                  {!cameraConnected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
                      <div className="text-center">
                        <Camera className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                        <div className="text-muted-foreground mb-2">
                          Camera not started
                        </div>
                        <div className="text-sm text-gray-500">
                          Click "Start Camera" to begin
                        </div>
                      </div>
                    </div>
                  )}
                  {cameraConnected && agentStatus !== "webrtc-connected" && agentStatus !== "idle" && (
                    <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                      {agentStatus === "fetching-ws-url" ? "Connecting to agent..." :
                       agentStatus === "ws-connecting" ? "Establishing connection..." :
                       agentStatus === "ws-open" ? "Setting up video feed..." :
                       agentStatus.startsWith("error") ? "Connection failed" :
                       "Connecting..."}
                    </div>
                  )}
                  {cameraConnected && agentStatus === "webrtc-connected" && (
                    <div className="absolute top-2 left-2 bg-green-500/80 text-white px-2 py-1 rounded text-xs">
                      ✓ Agent Connected
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Status Indicators */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatusIndicator 
                  status={cameraConnected ? "excellent" : "critical"} 
                  label="Camera Status" 
                />
                <StatusIndicator 
                  status={agentStatus === "webrtc-connected" ? "excellent" : agentStatus === "ws-open" ? "good" : agentStatus.startsWith("error") ? "critical" : "moderate"} 
                  label="Agent Connection" 
                />
                <StatusIndicator status={getStressStatus(currentMetrics.stressLevel)} label="Stress Level" />
              </CardContent>
            </Card>
          </div>

          {/* Metrics Cards */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                variant="stress"
              />
              <MetricCard
                title="Breathing Rate"
                value={currentMetrics.breathingRate}
                unit=" bpm"
                status={currentMetrics.breathingRate >= 12 && currentMetrics.breathingRate <= 16 ? "normal" : "high"}
                icon={<Activity className="h-4 w-4" />}
                variant="breathing"
              />
              <MetricCard
                title="Confidence Level"
                value={currentMetrics.confidenceLevel}
                status={currentMetrics.confidenceLevel > 80 ? "normal" : "low"}
                icon={<Zap className="h-4 w-4" />}
                variant="confidence"
              />
              <MetricCard
                title="Heart Rate"
                value={currentMetrics.heartRate}
                unit=" bpm"
                status={currentMetrics.heartRate >= 60 && currentMetrics.heartRate <= 80 ? "normal" : "high"}
                icon={<Heart className="h-4 w-4" />}
                variant="heart"
              />
            </div>

            {/* Progress Bars Section */}
            {/* <Card>
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
          </Card> */}

            <Card>
              <CardHeader>
                <CardTitle>Detailed Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <GradientBar label="Stress Level" value={currentMetrics.stressLevel} />
                <GradientBar label="Breathing Stability" value={Math.max(0, 100 - Math.abs(currentMetrics.breathingRate - 14) * 10)} />
                <GradientBar label="Analysis Confidence" value={currentMetrics.confidenceLevel} />
                
                {/* Real-time data indicator */}
                {realTimeData && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-sm font-medium text-green-800 mb-1">
                      Real-time Agent Data
                    </div>
                    <div className="text-xs text-green-600">
                      Last update: {new Date().toLocaleTimeString()}
                    </div>
                  </div>
                )}
                
                {agentStatus === "webrtc-connected" && !realTimeData && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-sm font-medium text-blue-800 mb-1">
                      Waiting for ML Analysis
                    </div>
                    <div className="text-xs text-blue-600">
                      Agent connected, processing video feed...
                    </div>
                  </div>
                )}
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



        {/* Control Panel */}
        {/* <Card>
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
        </Card> */}

      </div>
    </>
  )
}