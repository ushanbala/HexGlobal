"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { fetchGeolocation } from "@/lib/geolocation"
import { getWebSocketClient } from "@/lib/websocket"
import type { Echo } from "@/lib/websocket"

export function MessageInput() {
  const [username, setUsername] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [geo, setGeo] = useState<{
    latitude: number
    longitude: number
    country: string
    countryCode: string
  } | null>(null)

  // Fetch geolocation on mount
  useEffect(() => {
    fetchGeolocation().then(setGeo)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim() || !message.trim() || !geo) {
      return
    }

    if (message.length > 200) {
      alert("Message must be 200 characters or less")
      return
    }

    setLoading(true)

    try {
      const client = getWebSocketClient()
      const echo: Echo = {
        username: username.trim(),
        message: message.trim(),
        country: geo.country,
        countryCode: geo.countryCode,
        latitude: geo.latitude,
        longitude: geo.longitude,
        timestamp: Date.now(),
      }

      client.sendEcho(echo)
      setMessage("")
    } catch (error) {
      console.error("[v0] Error sending message:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Username</label>
        <Input
          placeholder="Enter your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={50}
          className="mt-2 bg-black/40 border-cyan-500/30 text-cyan-50 placeholder:text-gray-600 focus:border-cyan-400"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Message</label>
          <span className={`text-xs ${message.length > 150 ? "text-orange-400" : "text-gray-500"}`}>
            {message.length}/200
          </span>
        </div>
        <textarea
          placeholder="Share your echo with the world..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={200}
          className="mt-2 w-full bg-black/40 border border-cyan-500/30 rounded-md px-3 py-2 text-cyan-50 placeholder:text-gray-600 focus:outline-none focus:border-cyan-400 resize-none text-sm"
          rows={4}
        />
      </div>

      <Button
        type="submit"
        disabled={!username.trim() || !message.trim() || loading || !geo}
        className="w-full bg-cyan-600 hover:bg-cyan-500 text-black font-bold uppercase tracking-wider disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send Echo"}
      </Button>

      {geo && (
        <div className="text-xs text-gray-500">
          Sending from: <span className="text-cyan-400">{geo.country}</span>
        </div>
      )}
    </form>
  )
}
