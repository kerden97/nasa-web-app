import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Compass, House, Telescope } from 'lucide-react'

const recoveryLinks = [
  {
    to: '/',
    label: 'Return Home',
    description: 'Go back to the launchpad and start from the main experience.',
    Icon: House,
  },
  {
    to: '/wonders-of-the-universe',
    label: 'Explore Wonders',
    description: 'Jump into APOD, the NASA image archive, and EPIC Earth views.',
    Icon: Telescope,
  },
  {
    to: '/asteroid-watch',
    label: 'Open Asteroid Watch',
    description: 'Track near-Earth objects and close-approach activity.',
    Icon: Compass,
  },
] as const

export default function NotFoundPage() {
  const location = useLocation()

  useEffect(() => {
    document.title = '404 | Home & Beyond'
  }, [])

  return (
    <section className="relative overflow-hidden bg-slate-50 py-16 dark:bg-transparent sm:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(96,165,250,0.18),transparent_42%),radial-gradient(circle_at_80%_20%,rgba(14,165,233,0.12),transparent_28%)]" />

      <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-4xl border border-slate-200 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.16)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/88 dark:shadow-[0_24px_80px_rgba(2,6,23,0.45)]">
          <div className="border-b border-slate-200 px-6 py-5 dark:border-slate-800 sm:px-8">
            <p className="ui-kicker text-[#2563EB] dark:text-[#60A5FA]">404</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
              Page not found
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">
              The route you requested does not exist in this app. Try one of the live NASA
              experiences below instead.
            </p>
          </div>

          <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div>
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-900/60">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  Requested Path
                </p>
                <code className="mt-3 block overflow-x-auto rounded-2xl bg-slate-950 px-4 py-3 font-mono text-sm text-slate-100 dark:bg-slate-950">
                  {location.pathname}
                </code>
              </div>

              <div className="mt-6 space-y-4">
                {recoveryLinks.map(({ to, label, description, Icon }) => (
                  <Link
                    key={to}
                    to={to}
                    className="group flex items-start gap-4 rounded-[28px] border border-slate-200 bg-white px-5 py-5 transition hover:-translate-y-0.5 hover:border-[#2563EB]/30 hover:shadow-[0_16px_40px_rgba(37,99,235,0.12)] dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-[#60A5FA]/35 dark:hover:shadow-[0_16px_40px_rgba(2,6,23,0.38)]"
                  >
                    <div className="mt-0.5 rounded-2xl bg-slate-100 p-3 text-slate-900 transition-colors group-hover:text-[#2563EB] dark:bg-slate-800 dark:text-white dark:group-hover:text-[#60A5FA]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-lg font-semibold text-slate-950 transition-colors group-hover:text-[#2563EB] dark:text-white dark:group-hover:text-[#60A5FA]">
                        {label}
                      </p>
                      <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
                        {description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <aside className="rounded-[28px] border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/55">
              <p className="ui-kicker text-slate-500 dark:text-slate-400">What you can do</p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                <li>Check the URL for a typo in the section name or page slug.</li>
                <li>Use the Wonders menu for APOD, Image Library, and EPIC routes.</li>
                <li>Return to the homepage to restart from a known route.</li>
              </ul>
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}
