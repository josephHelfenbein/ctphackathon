"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, CameraOff, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface CameraFeedProps {
  onStreamStart?: (stream: MediaStream) => void
  onStreamStop?: () => void
  className?: string
}

export function CameraFeed({ onStreamStart, onStreamStop, className }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  const startCamera = async () => {
    try {
      setError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 540 },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }

      setStream(mediaStream)
      setIsStreaming(true)
      onStreamStart?.(mediaStream)
    } catch (err) {
      setError("Failed to access camera. Please check permissions.")
      console.error("Camera access error:", err)
    }
  }

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setIsStreaming(false)
    onStreamStop?.()
  }

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Live Camera Feed</CardTitle>
        <Button
          variant={isStreaming ? "destructive" : "default"}
          size="sm"
          onClick={isStreaming ? stopCamera : startCamera}
          className="flex items-center gap-2"
        >
          {isStreaming ? (
            <>
              <CameraOff className="h-4 w-4" />
              Disconnect
            </>
          ) : (
            <>
              <Camera className="h-4 w-4" />
              Connect
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        {error ? (
          <div className="flex items-center justify-center h-[300px] bg-muted">
            <div className="text-center">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-[300px] object-cover bg-black" />
        )}
      </CardContent>
    </Card>
  )
}
