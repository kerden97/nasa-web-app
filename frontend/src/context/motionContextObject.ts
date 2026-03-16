import { createContext } from 'react'

export interface MotionContextValue {
  starsPaused: boolean
  toggleStarsPaused: () => void
}

export const MotionContext = createContext<MotionContextValue | undefined>(undefined)
