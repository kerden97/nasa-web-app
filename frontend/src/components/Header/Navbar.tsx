import { useCallback, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu } from 'lucide-react'
import logo from '@/assets/logo.png'
import MotionToggle from './MotionToggle'
import ThemeToggle from './ThemeToggle'
import MobileMenu from './MobileMenu'

const navLinks = [
  { to: '/wonders-of-the-universe', label: 'Wonders', icon: '✨' },
  { to: '/asteroid-watch', label: 'Asteroid Watch', icon: '☄️' },
] as const

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const handleOpenMobileMenu = useCallback(() => setIsMobileMenuOpen(true), [])
  const handleCloseMobileMenu = useCallback(() => setIsMobileMenuOpen(false), [])

  return (
    <header className="relative z-50 border-b border-slate-200 bg-white py-3 dark:border-slate-800 dark:bg-slate-950">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Home & Beyond" className="h-12 w-12" />
            <span className="font-nasa text-xl tracking-widest text-slate-900 dark:text-white">
              Home & Beyond
            </span>
          </Link>
          <ul className="hidden items-center gap-5 md:flex">
            {navLinks.map(({ to, label, icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-base font-medium transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:ring-blue-900'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                    }`
                  }
                >
                  <span className="text-base leading-none" aria-hidden="true">
                    {icon}
                  </span>
                  {label}
                </NavLink>
              </li>
            ))}
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
        navLinks={navLinks}
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
