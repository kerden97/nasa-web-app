import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, Menu } from 'lucide-react'
import logo from '@/assets/logo.webp'
import { asteroidDestination, wondersDestinations } from '@/lib/navigation'
import { matchesRoute } from '@/lib/routeMatching'
import { wondersUiConfig } from '@/lib/wondersUi'
import MotionToggle from './MotionToggle'
import ThemeToggle from './ThemeToggle'
import MobileMenu from './MobileMenu'

export default function Navbar() {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isWondersOpen, setIsWondersOpen] = useState(false)
  const wondersRef = useRef<HTMLLIElement | null>(null)
  const handleOpenMobileMenu = useCallback(() => setIsMobileMenuOpen(true), [])
  const handleCloseMobileMenu = useCallback(() => setIsMobileMenuOpen(false), [])
  const closeWondersMenu = useCallback(() => setIsWondersOpen(false), [])

  const isWondersActive = matchesRoute(location.pathname, '/wonders-of-the-universe')
  const isAsteroidActive = matchesRoute(location.pathname, asteroidDestination.to)

  const desktopLinkBase =
    'inline-flex items-center gap-2 rounded-full px-4 py-2 text-base font-medium transition-all'
  const desktopLinkActive = 'text-[#2563EB] dark:text-[#60A5FA]'
  const desktopLinkIdle =
    'text-slate-900 hover:text-[#2563EB] dark:text-white dark:hover:text-[#60A5FA]'

  const currentWondersLabel = useMemo(() => {
    const match = wondersDestinations.find((destination) =>
      matchesRoute(location.pathname, destination.to),
    )
    return match?.shortLabel ?? 'Wonders'
  }, [location.pathname])

  useEffect(() => {
    if (!isWondersOpen) return

    const handlePointerDown = (event: MouseEvent) => {
      if (wondersRef.current && !wondersRef.current.contains(event.target as Node)) {
        closeWondersMenu()
      }
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeWondersMenu()
    }

    window.addEventListener('mousedown', handlePointerDown)
    window.addEventListener('keydown', handleEscape)

    return () => {
      window.removeEventListener('mousedown', handlePointerDown)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [isWondersOpen, closeWondersMenu])

  return (
    <header className="relative z-50 border-b border-slate-200 bg-white py-3 dark:border-slate-800 dark:bg-slate-950">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        <div className="flex items-center gap-6">
          <Link
            to="/"
            aria-label="Go to Home & Beyond homepage"
            className="relative z-10 inline-flex shrink-0 items-center gap-3 rounded-xl p-1 -m-1"
          >
            <img
              src={logo}
              alt=""
              aria-hidden="true"
              className="pointer-events-none h-12 w-12"
              width="48"
              height="48"
              decoding="async"
            />
            <span className="pointer-events-none whitespace-nowrap font-nasa text-xl tracking-widest text-slate-900 dark:text-white">
              Home & Beyond
            </span>
          </Link>
          <ul className="hidden items-center gap-5 md:flex">
            <li className="relative" ref={wondersRef}>
              <button
                type="button"
                aria-expanded={isWondersOpen}
                aria-haspopup="menu"
                onClick={() => setIsWondersOpen((open) => !open)}
                onMouseEnter={() => setIsWondersOpen(true)}
                className={`${desktopLinkBase} ${isWondersActive ? desktopLinkActive : desktopLinkIdle}`}
              >
                <span className="text-base leading-none" aria-hidden="true">
                  ✨
                </span>
                <span>{currentWondersLabel}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isWondersOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isWondersOpen && (
                <div
                  role="menu"
                  className="absolute left-0 top-full z-50 mt-3 w-[21rem] rounded-[24px] border border-slate-200 bg-white/96 p-2 shadow-[0_24px_80px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/96 dark:shadow-[0_24px_80px_rgba(2,6,23,0.55)]"
                  onMouseLeave={closeWondersMenu}
                >
                  <Link
                    role="menuitem"
                    to="/wonders-of-the-universe"
                    onClick={closeWondersMenu}
                    className="group mb-1 flex items-center gap-3 rounded-2xl px-4 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-950/30"
                  >
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-900 transition-colors group-hover:text-[#2563EB] dark:bg-slate-800/85 dark:text-white dark:group-hover:text-[#60A5FA]"
                      aria-hidden="true"
                    >
                      <span className="text-base leading-none">✨</span>
                    </div>
                    <p className="font-medium text-slate-900 transition-colors group-hover:text-[#2563EB] dark:text-white dark:group-hover:text-[#60A5FA]">
                      Wonders Hub
                    </p>
                  </Link>

                  <div className="space-y-0.5">
                    {wondersUiConfig.map((destination) => {
                      const { Icon } = destination
                      const active = matchesRoute(location.pathname, destination.to)

                      return (
                        <NavLink
                          role="menuitem"
                          key={destination.to}
                          to={destination.to}
                          onClick={closeWondersMenu}
                          className={`group flex items-center gap-3 rounded-2xl px-4 py-3 transition ${
                            active
                              ? 'bg-slate-100 dark:bg-slate-950/55'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-950/30'
                          }`}
                        >
                          <div
                            className={`rounded-xl bg-slate-100 p-2 transition-colors dark:bg-slate-800/85 ${
                              active
                                ? 'text-[#2563EB] dark:text-[#60A5FA]'
                                : 'text-slate-700 group-hover:text-[#2563EB] dark:text-white dark:group-hover:text-[#60A5FA]'
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <p
                            className={`text-sm font-medium transition-colors ${
                              active
                                ? 'text-[#2563EB] dark:text-[#60A5FA]'
                                : 'text-slate-900 group-hover:text-[#2563EB] dark:text-white dark:group-hover:text-[#60A5FA]'
                            }`}
                          >
                            {destination.label}
                          </p>
                        </NavLink>
                      )
                    })}
                  </div>
                </div>
              )}
            </li>

            <li>
              <NavLink
                to={asteroidDestination.to}
                onClick={closeWondersMenu}
                className={`${desktopLinkBase} ${isAsteroidActive ? desktopLinkActive : desktopLinkIdle}`}
              >
                <span className="text-base leading-none" aria-hidden="true">
                  ☄️
                </span>
                {asteroidDestination.label}
              </NavLink>
            </li>
          </ul>
        </div>
        <div className="flex items-center gap-2">
          <MotionToggle className="hidden md:inline-flex" />
          <ThemeToggle className="hidden md:inline-flex" />
          <button
            type="button"
            onClick={handleOpenMobileMenu}
            aria-label="Open mobile menu"
            className="inline-flex rounded-lg p-2 text-slate-600 transition hover:bg-slate-200 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white md:hidden"
          >
            <Menu size={22} />
          </button>
        </div>
      </nav>
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={handleCloseMobileMenu}
        motionToggle={
          <MotionToggle className="flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700" />
        }
        themeToggle={
          <ThemeToggle className="flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700" />
        }
      />
    </header>
  )
}
