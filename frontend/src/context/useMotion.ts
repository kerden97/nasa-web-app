import { useContext } from 'react'
import { MotionContext } from '@/context/motionContextObject'

export function useMotion() {
  const context = useContext(MotionContext)
  if (!context) {
    throw new Error('useMotion must be used within a MotionProvider')
  }
  return context
}
