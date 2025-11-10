"use client"

import { useEffect, useState } from "react"
import { getWebSocketClient } from "@/lib/websocket"

export function ConnectionStatus() {
  const [status, setStatus] = useState<"disconnected" | "connecting" | "connected">("disconnected")

  useEffect(() => {
    const client = getWebSocketClient()
    client.connect()

    // Subscribe to status changes
    const unsubscribe = client.onStatusChange(setStatus)

    return () => {
      unsubscribe()
    }
  }, [])

  const statusConfig = {
    connected: { color: "bg-green-500", text: "Connected" },
    connecting: { color: "bg-yellow-500", text: "Connecting" },
    disconnected: { color: "bg-red-500", text: "Disconnected" },
  }

  const config = statusConfig[status]

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${config.color} animate-pulse`} />
      <span className="text-xs text-gray-400 uppercase tracking-wider">{config.text}</span>
    </div>
  )
}
