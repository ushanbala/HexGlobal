// WebSocket connection management with auto-reconnect
export interface Echo {
  username: string
  message: string
  country: string
  countryCode: string
  latitude: number
  longitude: number
  timestamp: number
}

export type ConnectionStatus = "connected" | "connecting" | "disconnected"
type EchoCallback = (echo: Echo) => void
type StatusCallback = (status: ConnectionStatus) => void

export class WebSocketClient {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private echoCallbacks: Set<EchoCallback> = new Set()
  private statusCallbacks: Set<StatusCallback> = new Set()
  public status: ConnectionStatus = "disconnected"

  constructor(url: string) {
    this.url = url
  }

  connect(): void {
    if (this.status === "connecting" || this.status === "connected") return

    this.status = "connecting"
    this.notifyStatusChange()

    try {
      this.ws = new WebSocket(this.url)

      this.ws.onopen = () => {
        console.log("[v0] WebSocket connected")
        this.status = "connected"
        this.reconnectAttempts = 0
        this.notifyStatusChange()
      }

      this.ws.onmessage = (event) => {
        try {
          const echo: Echo = JSON.parse(event.data)
          this.notifyEcho(echo)
        } catch (error) {
          console.error("[v0] Failed to parse echo:", error)
        }
      }

      this.ws.onerror = (error) => {
        console.error("[v0] WebSocket error:", error)
      }

      this.ws.onclose = () => {
        console.log("[v0] WebSocket closed")
        this.status = "disconnected"
        this.notifyStatusChange()
        this.attemptReconnect()
      }
    } catch (error) {
      console.error("[v0] Failed to create WebSocket:", error)
      this.status = "disconnected"
      this.notifyStatusChange()
      this.attemptReconnect()
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("[v0] Max reconnection attempts reached")
      return
    }

    this.reconnectAttempts++
    console.log(
      `[v0] Attempting reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${this.reconnectDelay}ms`,
    )

    setTimeout(() => {
      this.connect()
    }, this.reconnectDelay)
  }

  sendEcho(echo: Echo): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error("[v0] WebSocket not connected")
      return
    }

    try {
      this.ws.send(JSON.stringify(echo))
      console.log("[v0] Echo sent:", echo)
    } catch (error) {
      console.error("[v0] Failed to send echo:", error)
    }
  }

  onEcho(callback: EchoCallback): () => void {
    this.echoCallbacks.add(callback)
    return () => {
      this.echoCallbacks.delete(callback)
    }
  }

  onStatusChange(callback: StatusCallback): () => void {
    this.statusCallbacks.add(callback)
    return () => {
      this.statusCallbacks.delete(callback)
    }
  }

  private notifyEcho(echo: Echo): void {
    this.echoCallbacks.forEach((callback) => {
      try {
        callback(echo)
      } catch (error) {
        console.error("[v0] Echo callback error:", error)
      }
    })
  }

  private notifyStatusChange(): void {
    this.statusCallbacks.forEach((callback) => {
      try {
        callback(this.status)
      } catch (error) {
        console.error("[v0] Status callback error:", error)
      }
    })
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
    this.status = "disconnected"
    this.notifyStatusChange()
  }
}

// Singleton instance
let client: WebSocketClient | null = null

export function getWebSocketClient(): WebSocketClient {
  if (!client) {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080/ws"
    client = new WebSocketClient(wsUrl)
  }
  return client
}
