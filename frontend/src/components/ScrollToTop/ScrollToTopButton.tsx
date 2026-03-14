import { useEffect, useState } from 'react'
import { CircleChevronUp } from 'lucide-react'

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 160)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  if (!isVisible) return null

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Scroll to top"
      className="fixed bottom-20 right-4 z-40 rounded-full border border-slate-200 bg-white/90 p-2 text-slate-700 shadow-lg backdrop-blur transition hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white lg:bottom-6 lg:right-6"
    >
      <CircleChevronUp size={26} />
    </button>
  )
}
