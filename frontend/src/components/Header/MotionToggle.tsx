import { Pause, Play } from 'lucide-react'
import { useMotion } from '@/context/useMotion'

interface MotionToggleProps {
  className?: string
}

export default function MotionToggle({ className = '' }: MotionToggleProps) {
  const { starsPaused, toggleStarsPaused } = useMotion()

  return (
    <button
      type="button"
      onClick={toggleStarsPaused}
      aria-pressed={starsPaused}
      aria-label={starsPaused ? 'Resume starfield animation' : 'Pause starfield animation'}
      className={`rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white ${className}`}
    >
      {starsPaused ? <Play size={20} /> : <Pause size={20} />}
    </button>
  )
}
