import { useEffect } from 'react'
import { Link } from 'react-router-dom'

const features = [
  {
    to: '/wonders-of-the-universe/apod',
    label: 'APOD',
    title: 'Astronomy Picture of the Day',
    description:
      'Featured daily image, browsable archive, date filters, and immersive detail views.',
    accent: 'blue' as const,
  },
  {
    to: '/wonders-of-the-universe/nasa-image-library',
    label: 'Image Library',
    title: 'NASA Image & Video Search',
    description: '140,000+ assets with full-text search, media filters, and in-app playback.',
    accent: 'indigo' as const,
  },
  {
    to: '/wonders-of-the-universe/epic',
    label: 'EPIC',
    title: 'Earth from Deep Space',
    description:
      'Full-disk Earth imagery from the DSCOVR satellite — natural and enhanced views, date presets, and downloads.',
    accent: 'emerald' as const,
  },
  {
    to: '/asteroid-watch',
    label: 'NeoWs',
    title: 'Asteroid Watch',
    description:
      'Track near-Earth objects with interactive charts, hazard classification, and a sortable data table.',
    accent: 'amber' as const,
  },
]

const accentMap = {
  blue: {
    badge:
      'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300',
    ring: 'group-hover:border-blue-300 dark:group-hover:border-blue-700',
    glow: 'group-hover:shadow-blue-100/60 dark:group-hover:shadow-blue-900/20',
  },
  indigo: {
    badge:
      'border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300',
    ring: 'group-hover:border-indigo-300 dark:group-hover:border-indigo-700',
    glow: 'group-hover:shadow-indigo-100/60 dark:group-hover:shadow-indigo-900/20',
  },
  emerald: {
    badge:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
    ring: 'group-hover:border-emerald-300 dark:group-hover:border-emerald-700',
    glow: 'group-hover:shadow-emerald-100/60 dark:group-hover:shadow-emerald-900/20',
  },
  amber: {
    badge:
      'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
    ring: 'group-hover:border-amber-300 dark:group-hover:border-amber-700',
    glow: 'group-hover:shadow-amber-100/60 dark:group-hover:shadow-amber-900/20',
  },
}

export default function HomePage() {
  useEffect(() => {
    document.title = 'Home & Beyond'
  }, [])

  return (
    <div className="relative overflow-hidden">
      {/* Ambient background gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-120 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(37,99,235,0.10),transparent_60%)] dark:bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(96,165,250,0.08),transparent_60%)]" />

      <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-20 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        {/* Hero */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-nasa text-xs uppercase tracking-[0.3em] text-blue-600 dark:text-blue-400">
            NASA Open-Data Explorer
          </p>

          <h1 className="mt-6 font-nasa text-5xl leading-[1.05] tracking-widest text-slate-950 dark:text-white sm:text-6xl xl:text-7xl">
            Home &amp; Beyond
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
            Four NASA APIs, one interface. Daily space imagery, a searchable media archive, live
            Earth views, and near-Earth asteroid tracking.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/wonders-of-the-universe"
              className="rounded-full bg-slate-950 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-950/20 transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:shadow-white/10 dark:hover:bg-slate-200"
            >
              Explore the Universe
            </Link>
            <Link
              to="/asteroid-watch"
              className="rounded-full border border-slate-200 px-7 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800/60"
            >
              Asteroid Watch
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid gap-5 sm:grid-cols-2">
          {features.map((f) => {
            const colors = accentMap[f.accent]
            return (
              <Link
                key={f.to}
                to={f.to}
                className={`group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 ${colors.ring} ${colors.glow} hover:-translate-y-1 hover:shadow-xl`}
              >
                <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.10),transparent_60%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.12),transparent_60%)]" />
                <span
                  className={`relative w-fit rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${colors.badge}`}
                >
                  {f.label}
                </span>

                <h2 className="relative mt-4 text-xl font-semibold text-slate-950 dark:text-white">
                  {f.title}
                </h2>

                <p className="relative mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                  {f.description}
                </p>

                <span className="relative mt-5 inline-flex w-fit items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700 transition group-hover:border-slate-300 group-hover:bg-slate-100 group-hover:text-slate-950 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200 dark:group-hover:border-slate-600 dark:group-hover:bg-slate-800 dark:group-hover:text-white">
                  Explore
                  <svg
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
