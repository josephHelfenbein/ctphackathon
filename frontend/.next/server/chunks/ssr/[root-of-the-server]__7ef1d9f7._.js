module.exports = [
"[project]/frontend/.next-internal/server/app/page/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

}),
"[project]/frontend/app/favicon.ico.mjs { IMAGE => \"[project]/frontend/app/favicon.ico (static in ecmascript)\" } [app-rsc] (structured image object, ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/frontend/app/favicon.ico.mjs { IMAGE => \"[project]/frontend/app/favicon.ico (static in ecmascript)\" } [app-rsc] (structured image object, ecmascript)"));
}),
"[project]/frontend/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/frontend/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/frontend/app/components/NavBar.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// import React from "react";
// type CameraStatus = "off" | "starting" | "on";
// interface NavBarProps {
//   appName?: string;
//   userName?: string;
//   cameraStatus?: CameraStatus;
//   onLogout?: () => void;
// }
// const statusColors: Record<CameraStatus, string> = {
//   off: "bg-red-500",
//   starting: "bg-yellow-500",
//   on: "bg-green-500",
// };
// export default function NavBar({
//   appName = "App Name",
//   userName = "User",
//   cameraStatus = "off",
//   onLogout,
// }: NavBarProps) {
//   const label =
//     cameraStatus === "on"
//       ? "Camera On"
//       : cameraStatus === "starting"
//       ? "Camera Starting"
//       : "Camera Off";
//   return (
//     <nav className="w-full bg-white shadow-md px-10 py-4 flex justify-between items-center">
//       {/* Left: App Logo/Name */}
//       <div className="flex items-center gap-2">
//         {/* ADD LOGO Here */}
//         <span className="font-semibold text-lg text-black">{appName}</span>
//       </div>
//       {/* Center: Camera Status */}
//       <div className="flex items-center gap-2 text-sm text-gray-600">
//         <div className={`w-3 h-3 rounded-full ${statusColors[cameraStatus]}`} />
//         <span>{label}</span>
//       </div>
//       {/* Right: User + Logout */}
//       <div className="flex items-center gap-6">
//         <span className="text-gray-700">Welcome, {userName}!</span>
//         <button
//           onClick={onLogout}
//           className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-md text-sm"
//         >
//           <strong>Logout</strong>
//         </button>
//       </div>
//     </nav>
//   );
// }
__turbopack_context__.s([
    "default",
    ()=>NavBar
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
;
const cameraStatusColors = {
    off: "bg-red-500",
    starting: "bg-yellow-500",
    on: "bg-green-500"
};
function NavBar({ userName, onLogout, cameraStatus }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
        className: "flex items-center justify-between px-6 py-3 shadow bg-white",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center space-x-2",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-xl font-bold text-gray-800",
                    children: "StressSense"
                }, void 0, false, {
                    fileName: "[project]/frontend/app/components/NavBar.tsx",
                    lineNumber: 83,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/frontend/app/components/NavBar.tsx",
                lineNumber: 82,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center space-x-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: `w-3 h-3 rounded-full ${cameraStatusColors[cameraStatus]}`
                    }, void 0, false, {
                        fileName: "[project]/frontend/app/components/NavBar.tsx",
                        lineNumber: 88,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-sm text-gray-600 capitalize",
                        children: cameraStatus === "on" ? "Camera On" : cameraStatus === "starting" ? "Starting..." : "Camera Off"
                    }, void 0, false, {
                        fileName: "[project]/frontend/app/components/NavBar.tsx",
                        lineNumber: 91,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/app/components/NavBar.tsx",
                lineNumber: 87,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center space-x-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "text-gray-700",
                        children: [
                            "Hi, ",
                            userName
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/app/components/NavBar.tsx",
                        lineNumber: 102,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        onClick: onLogout,
                        className: "px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200",
                        children: "Logout"
                    }, void 0, false, {
                        fileName: "[project]/frontend/app/components/NavBar.tsx",
                        lineNumber: 103,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/app/components/NavBar.tsx",
                lineNumber: 101,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/app/components/NavBar.tsx",
        lineNumber: 80,
        columnNumber: 5
    }, this);
}
}),
"[project]/frontend/app/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$app$2f$components$2f$NavBar$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/app/components/NavBar.tsx [app-rsc] (ecmascript)");
;
;
function Home() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$app$2f$components$2f$NavBar$2e$tsx__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
            fileName: "[project]/frontend/app/page.tsx",
            lineNumber: 7,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/frontend/app/page.tsx",
        lineNumber: 6,
        columnNumber: 5
    }, this);
} // "use client"
 // import { useState, useEffect, useRef } from "react"
 // import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
 // import { Button } from "@/components/ui/button"
 // import { Badge } from "@/components/ui/badge"
 // import { Progress } from "@/components/ui/progress"
 // import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
 // import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line } from "recharts"
 // import { Camera, CameraOff, Activity, Heart, Brain, Zap, TrendingUp, AlertTriangle } from 'lucide-react'
 // // Mock data for demonstration
 // const generateMockData = () => ({
 //   stressLevel: Math.floor(Math.random() * 100),
 //   breathingRate: Math.floor(Math.random() * 30) + 12,
 //   confidenceLevel: Math.floor(Math.random() * 100),
 //   heartRate: Math.floor(Math.random() * 40) + 60,
 //   timestamp: new Date().toLocaleTimeString()
 // })
 // const historicalData = Array.from({ length: 20 }, (_, i) => ({
 //   time: `${i + 1}m`,
 //   stress: Math.floor(Math.random() * 100),
 //   breathing: Math.floor(Math.random() * 30) + 12,
 //   confidence: Math.floor(Math.random() * 100)
 // }))
 // export default function StressAnxietyDashboard() {
 //   const [isMonitoring, setIsMonitoring] = useState(false)
 //   const [currentData, setCurrentData] = useState(generateMockData())
 //   const [stream, setStream] = useState<MediaStream | null>(null)
 //   const videoRef = useRef<HTMLVideoElement>(null)
 //   // Simulate real-time data updates
 //   useEffect(() => {
 //     if (!isMonitoring) return
 //     const interval = setInterval(() => {
 //       setCurrentData(generateMockData())
 //     }, 2000)
 //     return () => clearInterval(interval)
 //   }, [isMonitoring])
 //   const startMonitoring = async () => {
 //     try {
 //       const mediaStream = await navigator.mediaDevices.getUserMedia({ 
 //         video: { width: 640, height: 480 },
 //         audio: false 
 //       })
 //       if (videoRef.current) {
 //         videoRef.current.srcObject = mediaStream
 //       }
 //       setStream(mediaStream)
 //       setIsMonitoring(true)
 //     } catch (error) {
 //       console.error("[v0] Error accessing camera:", error)
 //       alert("Unable to access camera. Please check permissions.")
 //     }
 //   }
 //   const stopMonitoring = () => {
 //     if (stream) {
 //       stream.getTracks().forEach(track => track.stop())
 //       setStream(null)
 //     }
 //     setIsMonitoring(false)
 //   }
 //   const getStressLevelColor = (level: number) => {
 //     if (level < 30) return "text-chart-3"
 //     if (level < 70) return "text-chart-2"
 //     return "text-chart-1"
 //   }
 //   const getStressLevelBadge = (level: number) => {
 //     if (level < 30) return { variant: "secondary" as const, text: "Low", color: "bg-chart-3" }
 //     if (level < 70) return { variant: "secondary" as const, text: "Moderate", color: "bg-chart-2" }
 //     return { variant: "destructive" as const, text: "High", color: "bg-chart-1" }
 //   }
 //   const barData = [
 //     { name: "Stress", value: currentData.stressLevel, color: "var(--color-chart-1)" },
 //     { name: "Breathing", value: (currentData.breathingRate / 30) * 100, color: "var(--color-chart-2)" },
 //     { name: "Confidence", value: currentData.confidenceLevel, color: "var(--color-chart-3)" }
 //   ]
 //   return (
 //     <div className="min-h-screen bg-background p-6">
 //       <div className="max-w-7xl mx-auto space-y-6">
 //         {/* Header */}
 //         <div className="flex items-center justify-between">
 //           <div>
 //             <h1 className="text-3xl font-bold text-foreground">Stress & Anxiety Monitor</h1>
 //             <p className="text-muted-foreground">Real-time biometric analysis dashboard</p>
 //           </div>
 //           <div className="flex items-center gap-4">
 //             <Badge variant={isMonitoring ? "default" : "secondary"} className="px-3 py-1">
 //               {isMonitoring ? "Monitoring Active" : "Monitoring Inactive"}
 //             </Badge>
 //             <Button
 //               onClick={isMonitoring ? stopMonitoring : startMonitoring}
 //               variant={isMonitoring ? "destructive" : "default"}
 //               className="flex items-center gap-2"
 //             >
 //               {isMonitoring ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
 //               {isMonitoring ? "Stop Monitoring" : "Start Monitoring"}
 //             </Button>
 //           </div>
 //         </div>
 //         {/* Main Dashboard Grid */}
 //         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 //           {/* Camera Feed */}
 //           <Card className="lg:col-span-1">
 //             <CardHeader>
 //               <CardTitle className="flex items-center gap-2">
 //                 <Camera className="w-5 h-5" />
 //                 Live Camera Feed
 //               </CardTitle>
 //               <CardDescription>Facial and posture analysis</CardDescription>
 //             </CardHeader>
 //             <CardContent>
 //               <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
 //                 {isMonitoring ? (
 //                   <video
 //                     ref={videoRef}
 //                     autoPlay
 //                     muted
 //                     className="w-full h-full object-cover"
 //                   />
 //                 ) : (
 //                   <div className="flex items-center justify-center h-full text-muted-foreground">
 //                     <div className="text-center">
 //                       <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
 //                       <p>Click "Start Monitoring" to begin</p>
 //                     </div>
 //                   </div>
 //                 )}
 //               </div>
 //             </CardContent>
 //           </Card>
 //           {/* Real-time Metrics */}
 //           <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
 //             {/* Stress Level */}
 //             <Card>
 //               <CardHeader className="pb-3">
 //                 <CardTitle className="flex items-center gap-2 text-lg">
 //                   <Brain className="w-5 h-5 text-chart-1" />
 //                   Stress Level
 //                 </CardTitle>
 //               </CardHeader>
 //               <CardContent>
 //                 <div className="space-y-3">
 //                   <div className="flex items-center justify-between">
 //                     <span className={`text-3xl font-bold ${getStressLevelColor(currentData.stressLevel)}`}>
 //                       {currentData.stressLevel}%
 //                     </span>
 //                     <Badge {...getStressLevelBadge(currentData.stressLevel)}>
 //                       {getStressLevelBadge(currentData.stressLevel).text}
 //                     </Badge>
 //                   </div>
 //                   <Progress value={currentData.stressLevel} className="h-2" />
 //                 </div>
 //               </CardContent>
 //             </Card>
 //             {/* Breathing Rate */}
 //             <Card>
 //               <CardHeader className="pb-3">
 //                 <CardTitle className="flex items-center gap-2 text-lg">
 //                   <Activity className="w-5 h-5 text-chart-2" />
 //                   Breathing Rate
 //                 </CardTitle>
 //               </CardHeader>
 //               <CardContent>
 //                 <div className="space-y-3">
 //                   <div className="flex items-center justify-between">
 //                     <span className="text-3xl font-bold text-chart-2">
 //                       {currentData.breathingRate}
 //                     </span>
 //                     <span className="text-sm text-muted-foreground">breaths/min</span>
 //                   </div>
 //                   <Progress value={(currentData.breathingRate / 30) * 100} className="h-2" />
 //                 </div>
 //               </CardContent>
 //             </Card>
 //             {/* Confidence Level */}
 //             <Card>
 //               <CardHeader className="pb-3">
 //                 <CardTitle className="flex items-center gap-2 text-lg">
 //                   <Zap className="w-5 h-5 text-chart-3" />
 //                   Confidence Level
 //                 </CardTitle>
 //               </CardHeader>
 //               <CardContent>
 //                 <div className="space-y-3">
 //                   <div className="flex items-center justify-between">
 //                     <span className="text-3xl font-bold text-chart-3">
 //                       {currentData.confidenceLevel}%
 //                     </span>
 //                     <Badge variant="secondary">
 //                       {currentData.confidenceLevel > 70 ? "High" : currentData.confidenceLevel > 40 ? "Medium" : "Low"}
 //                     </Badge>
 //                   </div>
 //                   <Progress value={currentData.confidenceLevel} className="h-2" />
 //                 </div>
 //               </CardContent>
 //             </Card>
 //             {/* Heart Rate */}
 //             <Card>
 //               <CardHeader className="pb-3">
 //                 <CardTitle className="flex items-center gap-2 text-lg">
 //                   <Heart className="w-5 h-5 text-chart-4" />
 //                   Heart Rate
 //                 </CardTitle>
 //               </CardHeader>
 //               <CardContent>
 //                 <div className="space-y-3">
 //                   <div className="flex items-center justify-between">
 //                     <span className="text-3xl font-bold text-chart-4">
 //                       {currentData.heartRate}
 //                     </span>
 //                     <span className="text-sm text-muted-foreground">BPM</span>
 //                   </div>
 //                   <Progress value={(currentData.heartRate / 120) * 100} className="h-2" />
 //                 </div>
 //               </CardContent>
 //             </Card>
 //           </div>
 //         </div>
 //         {/* Charts Section */}
 //         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 //           {/* Bar Chart */}
 //           <Card>
 //             <CardHeader>
 //               <CardTitle className="flex items-center gap-2">
 //                 <TrendingUp className="w-5 h-5" />
 //                 Current Metrics Overview
 //               </CardTitle>
 //               <CardDescription>Real-time comparison of key indicators</CardDescription>
 //             </CardHeader>
 //             <CardContent>
 //               <ChartContainer
 //                 config={{
 //                   value: {
 //                     label: "Value",
 //                     color: "hsl(var(--chart-1))",
 //                   },
 //                 }}
 //                 className="h-[300px]"
 //               >
 //                 <ResponsiveContainer width="100%" height="100%">
 //                   <BarChart data={barData}>
 //                     <CartesianGrid strokeDasharray="3 3" />
 //                     <XAxis dataKey="name" />
 //                     <YAxis domain={[0, 100]} />
 //                     <ChartTooltip content={<ChartTooltipContent />} />
 //                     <Bar dataKey="value" fill="var(--color-chart-1)" radius={4} />
 //                   </BarChart>
 //                 </ResponsiveContainer>
 //               </ChartContainer>
 //             </CardContent>
 //           </Card>
 //           {/* Historical Trend */}
 //           <Card>
 //             <CardHeader>
 //               <CardTitle className="flex items-center gap-2">
 //                 <Activity className="w-5 h-5" />
 //                 Historical Trends
 //               </CardTitle>
 //               <CardDescription>Last 20 minutes of monitoring data</CardDescription>
 //             </CardHeader>
 //             <CardContent>
 //               <ChartContainer
 //                 config={{
 //                   stress: {
 //                     label: "Stress Level",
 //                     color: "hsl(var(--chart-1))",
 //                   },
 //                   confidence: {
 //                     label: "Confidence",
 //                     color: "hsl(var(--chart-3))",
 //                   },
 //                 }}
 //                 className="h-[300px]"
 //               >
 //                 <ResponsiveContainer width="100%" height="100%">
 //                   <LineChart data={historicalData}>
 //                     <CartesianGrid strokeDasharray="3 3" />
 //                     <XAxis dataKey="time" />
 //                     <YAxis domain={[0, 100]} />
 //                     <ChartTooltip content={<ChartTooltipContent />} />
 //                     <Line 
 //                       type="monotone" 
 //                       dataKey="stress" 
 //                       stroke="var(--color-chart-1)" 
 //                       strokeWidth={2}
 //                       dot={{ r: 4 }}
 //                     />
 //                     <Line 
 //                       type="monotone" 
 //                       dataKey="confidence" 
 //                       stroke="var(--color-chart-3)" 
 //                       strokeWidth={2}
 //                       dot={{ r: 4 }}
 //                     />
 //                   </LineChart>
 //                 </ResponsiveContainer>
 //               </ChartContainer>
 //             </CardContent>
 //           </Card>
 //         </div>
 //         {/* Status and Recommendations */}
 //         <Card>
 //           <CardHeader>
 //             <CardTitle className="flex items-center gap-2">
 //               <AlertTriangle className="w-5 h-5" />
 //               Analysis & Recommendations
 //             </CardTitle>
 //           </CardHeader>
 //           <CardContent>
 //             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 //               <div className="p-4 bg-muted rounded-lg">
 //                 <h4 className="font-semibold mb-2">Current Status</h4>
 //                 <p className="text-sm text-muted-foreground">
 //                   {isMonitoring 
 //                     ? `Monitoring active. Last update: ${currentData.timestamp}`
 //                     : "Start monitoring to begin real-time analysis"
 //                   }
 //                 </p>
 //               </div>
 //               <div className="p-4 bg-muted rounded-lg">
 //                 <h4 className="font-semibold mb-2">Breathing Pattern</h4>
 //                 <p className="text-sm text-muted-foreground">
 //                   {currentData.breathingRate > 20 
 //                     ? "Elevated breathing detected. Try deep breathing exercises."
 //                     : "Breathing pattern appears normal."
 //                   }
 //                 </p>
 //               </div>
 //               <div className="p-4 bg-muted rounded-lg">
 //                 <h4 className="font-semibold mb-2">Stress Indicators</h4>
 //                 <p className="text-sm text-muted-foreground">
 //                   {currentData.stressLevel > 70 
 //                     ? "High stress detected. Consider taking a break."
 //                     : "Stress levels appear manageable."
 //                   }
 //                 </p>
 //               </div>
 //             </div>
 //           </CardContent>
 //         </Card>
 //       </div>
 //     </div>
 //   )
 // }
 // export default function Home() {
 //   return (
 //     <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
 //       <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
 //         <Image
 //           className="dark:invert"
 //           src="/next.svg"
 //           alt="Next.js logo"
 //           width={180}
 //           height={38}
 //           priority
 //         />
 //         <ol className="font-mono list-inside list-decimal text-sm/6 text-center sm:text-left">
 //           <li className="mb-2 tracking-[-.01em]">
 //             Get started by editing{" "}
 //             <code className="bg-black/[.05] dark:bg-white/[.06] font-mono font-semibold px-1 py-0.5 rounded">
 //               app/page.tsx
 //             </code>
 //             .
 //           </li>
 //           <li className="tracking-[-.01em]">
 //             Save and see your changes instantly.
 //           </li>
 //         </ol>
 //         <div className="flex gap-4 items-center flex-col sm:flex-row">
 //           <a
 //             className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
 //             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
 //             target="_blank"
 //             rel="noopener noreferrer"
 //           >
 //             <Image
 //               className="dark:invert"
 //               src="/vercel.svg"
 //               alt="Vercel logomark"
 //               width={20}
 //               height={20}
 //             />
 //             Deploy now
 //           </a>
 //           <a
 //             className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
 //             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
 //             target="_blank"
 //             rel="noopener noreferrer"
 //           >
 //             Read our docs
 //           </a>
 //         </div>
 //       </main>
 //       <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
 //         <a
 //           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
 //           href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
 //           target="_blank"
 //           rel="noopener noreferrer"
 //         >
 //           <Image
 //             aria-hidden
 //             src="/file.svg"
 //             alt="File icon"
 //             width={16}
 //             height={16}
 //           />
 //           Learn
 //         </a>
 //         <a
 //           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
 //           href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
 //           target="_blank"
 //           rel="noopener noreferrer"
 //         >
 //           <Image
 //             aria-hidden
 //             src="/window.svg"
 //             alt="Window icon"
 //             width={16}
 //             height={16}
 //           />
 //           Examples
 //         </a>
 //         <a
 //           className="flex items-center gap-2 hover:underline hover:underline-offset-4"
 //           href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
 //           target="_blank"
 //           rel="noopener noreferrer"
 //         >
 //           <Image
 //             aria-hidden
 //             src="/globe.svg"
 //             alt="Globe icon"
 //             width={16}
 //             height={16}
 //           />
 //           Go to nextjs.org →
 //         </a>
 //       </footer>
 //     </div>
 //   );
 // }
}),
"[project]/frontend/app/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/frontend/app/page.tsx [app-rsc] (ecmascript)"));
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__7ef1d9f7._.js.map