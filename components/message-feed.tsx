"use client"

import { motion, AnimatePresence } from "framer-motion"
import { getCountryFlag } from "@/lib/geolocation"

interface Echo {
  id: string
  username: string
  message: string
  country: string
  countryCode: string
  timestamp: number
}

interface MessageFeedProps {
  messages: Echo[]
}

export function MessageFeed({ messages }: MessageFeedProps) {
  return (
    <div className="flex flex-col gap-2 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
      <AnimatePresence mode="popLayout">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: -20, x: -50 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3 }}
            className="bg-black/40 border border-cyan-500/30 rounded-lg p-3 hover:border-cyan-500/60 transition-colors"
          >
            <div className="flex items-start gap-2">
              <div className="text-xl flex-shrink-0">{getCountryFlag(msg.countryCode)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-bold text-sm text-cyan-300 truncate">{msg.username}</h3>
                  <span className="text-xs text-gray-500 flex-shrink-0">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-gray-300 mt-1 break-words">{msg.message}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
