"use client"

import { useState, useEffect, useCallback } from "react"
import { GlobeComponent } from "@/components/globe"
import { MessageFeed } from "@/components/message-feed"
import { MessageInput } from "@/components/message-input"
import { ConnectionStatus } from "@/components/connection-status"
import { getWebSocketClient } from "@/lib/websocket"
import type { Echo } from "@/lib/websocket"

interface GlobeEcho {
  id: string
  username: string
  message: string
  country: string
  countryCode: string
  lat: number
  lng: number
  createdAt: number
  size: number
}

let echoIdCounter = 0

export default function Home() {
  const [messages, setMessages] = useState<(Echo & { id: string })[]>([])
  const [globePoints, setGlobePoints] = useState<GlobeEcho[]>([])

  const handleNewEcho = useCallback((echo: Echo) => {
    const id = `echo-${Date.now()}-${++echoIdCounter}`
    const newMessage = { ...echo, id }

    // Add to message feed (max 20 messages)
    setMessages((prev) => [newMessage, ...prev].slice(0, 20))

    // Add to globe
    const globeEcho: GlobeEcho = {
      id,
      username: echo.username,
      message: echo.message,
      country: echo.country,
      countryCode: echo.countryCode,
      lat: echo.latitude,
      lng: echo.longitude,
      createdAt: echo.timestamp,
      size: 2,
    }

    setGlobePoints((prev) => [globeEcho, ...prev])
  }, [])

 

  useEffect(() => {
    const client = getWebSocketClient()

    // Subscribe to incoming echoes
    const unsubscribe = client.onEcho(handleNewEcho)

    return () => {
      unsubscribe()
    }
  }, [handleNewEcho])

  const activeEchoCount = globePoints.length

  return (
    <main className="w-screen h-screen overflow-hidden bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold neon-text">HexGlobal</h1>
          <span className="text-xs text-gray-500">Global Realtime Wall</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-xs text-gray-400">
            Active Echoes: <span className="text-cyan-400 font-bold">{activeEchoCount}</span>
          </div>
          <ConnectionStatus />
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full h-full pt-16 grid grid-cols-1 md:grid-cols-[300px_1fr_320px] gap-4 p-4">
        {/* Left: Message Feed */}
        <div className="hidden md:flex flex-col bg-black/40 border border-cyan-500/20 rounded-lg p-4 overflow-hidden">
          <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-4">Latest Echoes</h2>
          <MessageFeed messages={messages} />
        </div>

        {/* Center: Globe */}
        <div className="flex flex-col bg-black/20 border border-cyan-500/20 rounded-lg p-2 overflow-hidden globe-container">
          <GlobeComponent points={globePoints} />
        </div>

        {/* Right: Message Input */}
        <div className="flex flex-col bg-black/40 border border-cyan-500/20 rounded-lg p-4 overflow-hidden">
          <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-4">Send Echo</h2>
          <MessageInput />
        </div>
      </div>

      {/* Mobile: Stacked Layout */}
      <div className="md:hidden w-full h-full overflow-y-auto flex flex-col gap-4 p-4 pt-20">
        {/* Mobile Globe */}
        <div className="flex flex-col bg-black/20 border border-cyan-500/20 rounded-lg p-2 overflow-hidden h-64 globe-container">
          <GlobeComponent points={globePoints} />
        </div>

        {/* Mobile Messages */}
        <div className="flex flex-col bg-black/40 border border-cyan-500/20 rounded-lg p-4 flex-1">
          <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-4">Latest Echoes</h2>
          <MessageFeed messages={messages} />
        </div>

        {/* Mobile Input */}
        <div className="flex flex-col bg-black/40 border border-cyan-500/20 rounded-lg p-4">
          <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-4">Send Echo</h2>
          <MessageInput />
        </div>
      </div>
    </main>
  )
}
