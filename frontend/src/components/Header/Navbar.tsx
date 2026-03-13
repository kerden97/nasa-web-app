import logo from '../../assets/logo.png'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white px-6 py-3 dark:border-slate-800 dark:bg-slate-900">
      <nav className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Home & Beyond" className="h-10 w-10" />
          <span className="text-lg font-semibold text-slate-900 dark:text-white">
            Home & Beyond
          </span>
        </div>
        <ThemeToggle />
      </nav>
    </header>
  )
}
