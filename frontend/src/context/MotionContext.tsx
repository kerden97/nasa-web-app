import { createContext, useContext, useEffect, useState } from 'react'

interface MotionContextValue {
  starsPaused: boolean
  toggleStarsPaused: () => void
}

const MotionContext = createContext<MotionContextValue | undefined>(undefined)

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

export function useMotion() {
  const context = useContext(MotionContext)
  if (!context) {
    throw new Error('useMotion must be used within a MotionProvider')
  }
  return context
}
