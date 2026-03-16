import { useEffect, useState } from 'react'
import { MotionContext } from '@/context/motionContextObject'

export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [starsPaused, setStarsPaused] = useState<boolean>(() => {
    const stored = localStorage.getItem('stars-paused')
    if (stored !== null) return stored === 'true'
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  })

  useEffect(() => {
    localStorage.setItem('stars-paused', String(starsPaused))
  }, [starsPaused])

  const toggleStarsPaused = () => setStarsPaused((prev) => !prev)

  return (
    <MotionContext.Provider value={{ starsPaused, toggleStarsPaused }}>
      {children}
    </MotionContext.Provider>
  )
}
