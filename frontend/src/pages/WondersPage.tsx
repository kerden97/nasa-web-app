import { useEffect } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Breadcrumbs from '@/components/Breadcrumbs'

const tabs = [
  { to: 'apod', label: 'Astronomy Picture of the Day' },
  { to: 'nasa-image-library', label: 'NASA Image Library' },
  { to: 'epic', label: 'EPIC' },
]

export default function WondersPage() {
  const location = useLocation()
  const navigate = useNavigate()

  // Redirect bare /wonders-of-the-universe to /wonders-of-the-universe/apod
  useEffect(() => {
    if (location.pathname === '/wonders-of-the-universe') {
      navigate('apod', { replace: true })
    }
  }, [location.pathname, navigate])

  useEffect(() => {
    document.title = 'Wonders of the Universe | Home & Beyond'
  }, [])

  const pillBase =
    'whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all duration-200'
  const pillIdle =
    'border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800'
  const pillActive =
    'border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300'

  const activeTabLabel =
    tabs.find((tab) => location.pathname.endsWith(`/${tab.to}`))?.label ??
    'Astronomy Picture of the Day'

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Wonders of the Universe' },
          { label: activeTabLabel },
        ]}
      />

      <div className="mb-6">
        <p className="mb-2 font-nasa text-xs uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">
          Space Stories Hub
        </p>
        <h1 className="font-nasa text-3xl tracking-widest text-slate-900 dark:text-white">
          Wonders of the Universe
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Explore NASA&apos;s featured daily stories, image archive, and Earth imagery
        </p>
      </div>

      <nav className="mb-8 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) => `${pillBase} ${isActive ? pillActive : pillIdle}`}
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </section>
  )
}
