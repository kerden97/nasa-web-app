import { useEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Compass, House, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { asteroidDestination } from '@/lib/navigation'
import { wondersUiConfig } from '@/lib/wondersUi'
import { useMotion } from '@/context/useMotion'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
  motionToggle: ReactNode
  themeToggle: ReactNode
}

export default function MobileMenu({
  isOpen,
  onClose,
  motionToggle,
  themeToggle,
}: MobileMenuProps) {
  const { starsPaused } = useMotion()
  const location = useLocation()
  const previousPathnameRef = useRef(location.pathname)
  const isWondersHubActive = location.pathname === '/wonders-of-the-universe'

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
    const handleResize = () => {
      if (window.innerWidth >= 768) onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', handleResize)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleResize)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm md:hidden"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className="ml-auto flex h-full w-full max-w-sm flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-[#2563EB] dark:text-[#60A5FA]">
              <Compass size={16} />
              <p className="text-xs font-semibold uppercase tracking-[0.16em]">Explore</p>
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
            <p className="ui-kicker text-slate-500 dark:text-slate-400">Home &amp; Beyond</p>
            <h2 className="mt-3 text-xl font-semibold text-slate-950 dark:text-white">
              Start from the launchpad
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Begin at the main landing page, then jump into the live NASA experiences from here.
            </p>
          </div>

          <nav aria-label="Mobile" className="mt-6 space-y-2">
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
                    ? 'border-[rgba(37,99,235,0.18)] bg-[rgba(37,99,235,0.08)] text-[#2563EB] shadow-sm dark:border-[rgba(96,165,250,0.26)] dark:bg-[rgba(37,99,235,0.22)] dark:text-[#60A5FA]'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white'
                }`
              }
            >
              <House size={18} />
              Home
            </NavLink>
            <div className="rounded-[28px] border border-slate-200 p-4 dark:border-slate-800">
              <NavLink
                to="/wonders-of-the-universe"
                onClick={(e) => {
                  if (location.pathname === '/wonders-of-the-universe') e.preventDefault()
                  onClose()
                }}
                className={() =>
                  `flex items-center gap-3 rounded-2xl border px-4 py-3 text-lg font-medium transition ${
                    isWondersHubActive
                      ? 'border-[rgba(37,99,235,0.18)] bg-[rgba(37,99,235,0.08)] text-[#2563EB] shadow-sm dark:border-[rgba(96,165,250,0.26)] dark:bg-[rgba(37,99,235,0.22)] dark:text-[#60A5FA]'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`
                }
              >
                <span aria-hidden="true">✨</span>
                Wonders
              </NavLink>

              <div className="mt-3 space-y-2 pl-2">
                {wondersUiConfig.map((destination) => {
                  const { Icon } = destination
                  return (
                    <NavLink
                      key={destination.to}
                      to={destination.to}
                      onClick={(e) => {
                        if (location.pathname.startsWith(destination.to)) e.preventDefault()
                        onClose()
                      }}
                      className={({ isActive }) =>
                        `flex items-center gap-3 rounded-2xl border px-4 py-3 text-base font-medium transition ${
                          isActive
                            ? 'border-[rgba(37,99,235,0.18)] bg-[rgba(37,99,235,0.08)] text-[#2563EB] shadow-sm dark:border-[rgba(96,165,250,0.26)] dark:bg-[rgba(37,99,235,0.22)] dark:text-[#60A5FA]'
                            : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white'
                        }`
                      }
                    >
                      <Icon size={16} />
                      {destination.label}
                    </NavLink>
                  )
                })}
              </div>
            </div>

            <NavLink
              to={asteroidDestination.to}
              onClick={(e) => {
                if (location.pathname.startsWith(asteroidDestination.to)) e.preventDefault()
                onClose()
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl border px-4 py-3 text-lg font-medium transition ${
                  isActive
                    ? 'border-[rgba(37,99,235,0.18)] bg-[rgba(37,99,235,0.08)] text-[#2563EB] shadow-sm dark:border-[rgba(96,165,250,0.26)] dark:bg-[rgba(37,99,235,0.22)] dark:text-[#60A5FA]'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white'
                }`
              }
            >
              <span aria-hidden="true">☄️</span>
              {asteroidDestination.label}
            </NavLink>
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
