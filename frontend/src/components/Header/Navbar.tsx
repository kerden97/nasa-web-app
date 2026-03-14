import { useCallback, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Menu } from 'lucide-react'
import logo from '@/assets/logo.png'
import ThemeToggle from './ThemeToggle'
import MobileMenu from './MobileMenu'

const navLinks = [{ to: '/wonders-of-the-universe', label: 'Wonders', icon: '✨' }] as const

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const handleOpenMobileMenu = useCallback(() => setIsMobileMenuOpen(true), [])
  const handleCloseMobileMenu = useCallback(() => setIsMobileMenuOpen(false), [])

  return (
    <header className="border-b border-slate-200 bg-white py-3 dark:border-slate-800 dark:bg-slate-900">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Home & Beyond" className="h-12 w-12" />
            <span className="font-nasa text-xl tracking-widest text-slate-900 dark:text-white">
              Home & Beyond
            </span>
          </Link>
          <ul className="hidden items-center gap-4 md:flex">
            {navLinks.map(({ to, label, icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 text-base font-medium transition-colors ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`
                  }
                >
                  <span aria-hidden="true">{icon}</span>
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex items-center gap-2">
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
        themeToggle={
          <ThemeToggle className="flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700" />
        }
      />
    </header>
  )
}
