import { Link } from 'react-router-dom'

const footerLinks = [
  { to: '/wonders-of-the-universe/apod', label: 'APOD' },
  { to: '/wonders-of-the-universe/nasa-image-library', label: 'Image Library' },
  { to: '/wonders-of-the-universe/epic', label: 'EPIC' },
  { to: '/asteroid-watch', label: 'Asteroid Watch' },
] as const

export default function Footer() {
  return (
    <footer className="relative z-20 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-between">
          {/* Brand + tagline */}
          <div className="text-center sm:text-left">
            <Link
              to="/"
              className="font-nasa text-lg tracking-widest text-slate-900 dark:text-white"
            >
              Home &amp; Beyond
            </Link>
            <p className="mt-2 max-w-xs text-sm text-slate-500 dark:text-slate-400">
              Exploring the cosmos through NASA imagery, Earth observation, and asteroid tracking in
              one place.
            </p>
          </div>

          {/* Quick links */}
          <nav aria-label="Footer">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
              {footerLinks.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-slate-500 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Divider + bottom row */}
        <div className="mt-8 flex flex-col items-center gap-3 border-t border-slate-200 pt-6 text-xs text-slate-500 dark:border-slate-800 sm:flex-row sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Home &amp; Beyond</p>
          <p className="flex items-center gap-1.5">
            Powered by{' '}
            <a
              href="https://api.nasa.gov/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2.5 py-0.5 text-xs font-medium text-blue-600 transition-colors hover:border-blue-400 hover:text-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-400 dark:hover:border-blue-700 dark:hover:text-blue-300"
            >
              <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                <path
                  d="M8 16l2-8 4 6 2-6"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              NASA Open APIs
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
