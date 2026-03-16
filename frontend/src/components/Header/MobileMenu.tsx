import { useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Compass, House, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { useMotion } from '@/context/MotionContext'

interface MobileMenuLink {
  to: string
  label: string
  icon: string
}

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  navLinks: readonly MobileMenuLink[]
  motionToggle: ReactNode
  themeToggle: ReactNode
}

export default function MobileMenu({
  isOpen,
  onClose,
  navLinks,
  motionToggle,
  themeToggle,
}: MobileMenuProps) {
  const { starsPaused } = useMotion()
  const location = useLocation()
  const previousPathnameRef = useRef(location.pathname)

  useEffect(() => {
    if (!isOpen) {
      previousPathnameRef.current = location.pathname
      return
    }

    if (previousPathnameRef.current !== location.pathname) {
      previousPathnameRef.current = location.pathname
      onClose()
    }
  }, [isOpen, location.pathname, onClose])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm md:hidden"
      onClick={onClose}
    >
      <div
        className="ml-auto flex h-full w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Compass size={16} />
              <p className="font-nasa text-xs uppercase tracking-[0.22em]">Explore</p>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Pick a destination and keep moving through the app.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close mobile menu"
            className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/60">
            <p className="font-nasa text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              Home &amp; Beyond
            </p>
            <h2 className="mt-3 text-xl font-semibold text-slate-950 dark:text-white">
              Start from the launchpad
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Begin at the main landing page, then jump into the live NASA experiences from here.
            </p>
          </div>

          <nav className="mt-6 space-y-2">
            <NavLink
              to="/"
              end
              onClick={(e) => {
                if (location.pathname === '/') e.preventDefault()
                onClose()
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl border px-4 py-3 text-lg font-medium transition ${
                  isActive
                    ? 'border-blue-200 bg-blue-50 text-blue-700 shadow-sm dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white'
                }`
              }
            >
              <House size={18} />
              Home
            </NavLink>
            {navLinks.map(({ to, label, icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={(e) => {
                  if (location.pathname.startsWith(to)) e.preventDefault()
                  onClose()
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl border px-4 py-3 text-lg font-medium transition ${
                    isActive
                      ? 'border-blue-200 bg-blue-50 text-blue-700 shadow-sm dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`
                }
              >
                <span aria-hidden="true">{icon}</span>
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-6 space-y-3">
            {themeToggle}
            <div>
              {motionToggle}
              <p className="mt-2 px-1 text-xs text-slate-500 dark:text-slate-400">
                {starsPaused ? 'Start falling star animation.' : 'Stop falling star animation.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
