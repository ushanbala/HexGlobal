"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

interface GlobePoint {
  id: string
  lat: number
  lng: number
  username: string
  message: string
  createdAt: number
  size: number
}

interface GlobeProps {
  points: GlobePoint[]
}

export function GlobeComponent({ points }: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const globeRef = useRef<any>(null)
  const pointsMapRef = useRef<Map<string, GlobePoint>>(new Map())

  useEffect(() => {
    let globe: any

    const loadGlobe = async () => {
      const Globe = (await import("globe.gl")).default
      if (!containerRef.current) return

      // ✅ Correct initialization using `new Globe()`
      globe = new Globe(containerRef.current)
        .globeImageUrl("/earth-dark.jpg")
        .backgroundColor("#000000")
        .showAtmosphere(true)
        .atmosphereColor("#00ffff")
        .atmosphereAltitude(0.15)

      globe.camera().position.z = 250
      globe.controls().autoRotate = true
      globe.controls().autoRotateSpeed = 0.5

      globeRef.current = globe

      // Handle resize
      const handleResize = () => {
        if (containerRef.current) {
          globe.width(containerRef.current.clientWidth)
          globe.height(containerRef.current.clientHeight)
        }
      }
      window.addEventListener("resize", handleResize)
    }

    loadGlobe()

    return () => {
      window.removeEventListener("resize", () => {})
    }
  }, [])

  useEffect(() => {
    if (!globeRef.current) return

    const now = Date.now()
    const fadeOutDuration = 3000
    const visibleDuration = 30000

    // Remove expired
    const idsToRemove: string[] = []
    pointsMapRef.current.forEach((point, id) => {
      if (now - point.createdAt > visibleDuration) {
        idsToRemove.push(id)
      }
    })
    idsToRemove.forEach((id) => pointsMapRef.current.delete(id))

    // Add new
    points.forEach((p) => {
      if (!pointsMapRef.current.has(p.id)) {
        pointsMapRef.current.set(p.id, p)
      }
    })

    const pointsArray = Array.from(pointsMapRef.current.values()).map((p) => {
      const age = now - p.createdAt
      let opacity = 1
      if (age > visibleDuration - fadeOutDuration) {
        opacity = Math.max(0, 1 - (age - (visibleDuration - fadeOutDuration)) / fadeOutDuration)
      }
      return { ...p, opacity }
    })

    const globe = globeRef.current
    if (typeof globe.pointsData !== "function") return // ✅ Safety check

    globe
      .pointsData(pointsArray)
      .pointAltitude((d: any) => 0.01 + d.opacity * 0.02)
      .pointColor((d: any) => `rgba(0, 255, 255, ${d.opacity})`)
      .pointRadius((d: any) => 0.5 * (d.size || 1))
      .pointLabel((d: any) => `
        <div class="text-xs text-white">
          <div class="font-bold">${d.username}</div>
          <div class="text-gray-400">${d.message}</div>
        </div>
      `)
  }, [points])

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-lg overflow-hidden border border-cyan-500/20"
      style={{ minHeight: "400px" }}
    />
  )
}
