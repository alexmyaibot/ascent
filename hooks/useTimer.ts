'use client'

import { useState, useEffect, useCallback } from 'react'

export function useTimer() {
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(s => s + 1)
      }, 1000)
    }

    return () => clearInterval(interval)
  }, [isRunning])

  const start = useCallback(() => {
    setIsRunning(true)
  }, [])

  const stop = useCallback(() => {
    setIsRunning(false)
  }, [])

  const reset = useCallback(() => {
    setSeconds(0)
    setIsRunning(false)
  }, [])

  const formatTime = useCallback((secs: number) => {
    const hours = Math.floor(secs / 3600)
    const minutes = Math.floor((secs % 3600) / 60)
    const remainingSeconds = secs % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }, [])

  return {
    seconds,
    isRunning,
    start,
    stop,
    reset,
    formatTime: formatTime(seconds),
  }
}
