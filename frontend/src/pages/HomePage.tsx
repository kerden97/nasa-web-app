import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Telescope, Image, Globe, Radar, ChevronDown } from 'lucide-react'
import Starfield from '@/components/Starfield/Starfield'

import heroNebula from '@/assets/home/hero-nebula.jpg'
import cardApod from '@/assets/home/card-apod.jpg'
import cardLibrary from '@/assets/home/card-library.jpg'
import cardEpic from '@/assets/home/card-epic.jpg'
import cardNeows from '@/assets/home/card-neows.jpg'

/* ── Feature cards data ── */

const features = [
  {
    to: '/wonders-of-the-universe/apod',
    label: 'APOD',
    title: 'Astronomy Picture of the Day',
    description:
      'Featured daily image, browsable archive, date filters, and immersive detail views.',
    Icon: Telescope,
    glow: 'card-glow--blue',
    borderHover: 'hover:border-blue-500/40',
    badgeBg: 'bg-blue-600/90',
    exploreColor:
      'text-blue-600 group-hover:text-blue-500 dark:text-blue-400 dark:group-hover:text-blue-300',
    image: cardApod,
    imageAlt: 'Carina Nebula — JWST Cosmic Cliffs',
  },
  {
    to: '/wonders-of-the-universe/nasa-image-library',
    label: 'Image Library',
    title: 'NASA Image & Video Search',
    description: '140,000+ assets with full-text search, media filters, and in-app playback.',
    Icon: Image,
    glow: 'card-glow--violet',
    borderHover: 'hover:border-violet-500/40',
    badgeBg: 'bg-violet-600/90',
    exploreColor:
      'text-violet-600 group-hover:text-violet-500 dark:text-violet-400 dark:group-hover:text-violet-300',
    image: cardLibrary,
    imageAlt: 'Astronaut spacewalk with Earth in background',
  },
  {
    to: '/wonders-of-the-universe/epic',
    label: 'EPIC',
    title: 'Earth from Deep Space',
    description:
      'Full-disk Earth imagery from the DSCOVR satellite — natural and enhanced views, date presets, and downloads.',
    Icon: Globe,
    glow: 'card-glow--emerald',
    borderHover: 'hover:border-emerald-500/40',
    badgeBg: 'bg-emerald-600/90',
    exploreColor:
      'text-emerald-600 group-hover:text-emerald-500 dark:text-emerald-400 dark:group-hover:text-emerald-300',
    image: cardEpic,
    imageAlt: 'The Blue Marble — full-disk Earth from Apollo 17',
  },
  {
    to: '/asteroid-watch',
    label: 'NeoWs',
    title: 'Asteroid Watch',
    description:
      'Track near-Earth objects with interactive charts, hazard classification, and a sortable data table.',
    Icon: Radar,
    glow: 'card-glow--amber',
    borderHover: 'hover:border-amber-500/40',
    badgeBg: 'bg-amber-600/90',
    exploreColor:
      'text-amber-600 group-hover:text-amber-500 dark:text-amber-400 dark:group-hover:text-amber-300',
    image: cardNeows,
    imageAlt: 'Near-Earth asteroid orbital distribution',
  },
]

/* ── Stats bar ── */

const stats = [
  { value: '4', label: 'Cosmic Feeds' },
  { value: '140K+', label: 'Images & Videos' },
  { value: 'Daily', label: 'Fresh Content' },
  { value: 'Live', label: 'Asteroid Tracking' },
]

/* ── Component ── */

export default function HomePage() {
  useEffect(() => {
    document.title = 'Home & Beyond'
  }, [])

  return (
    <div className="relative overflow-hidden">
      {/* ── Hero ── */}
      <section className="relative z-1 flex min-h-[calc(100svh-4.5rem)] items-center justify-center overflow-hidden">
        {/* Nebula background image */}
        <img
          src={heroNebula}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <Starfield className="pointer-events-none absolute inset-0 z-1" />
        <div className="pointer-events-none absolute inset-0 z-2 bg-linear-to-b from-slate-950/72 via-slate-950/58 to-slate-950/78" />

        {/* Nebula glow accents */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-3 h-150 w-200 -translate-x-1/2 -translate-y-1/3 rounded-full bg-purple-600/10 blur-[150px]" />
        <div className="pointer-events-none absolute left-1/3 top-2/3 z-3 h-100 w-125 rounded-full bg-teal-500/8 blur-[120px]" />
        <div className="relative z-20 mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="animate-fade-in-up delay-100 font-nasa text-xs uppercase tracking-[0.35em] text-cyan-400 drop-shadow-[0_2px_12px_rgba(2,6,23,0.98)]">
            NASA Open-Data Explorer
          </p>

          <h1 className="hero-glow animate-fade-in-up delay-250 mt-6 font-nasa text-5xl leading-[1.05] tracking-widest text-cyan-300 drop-shadow-[0_4px_24px_rgba(2,6,23,0.9)] sm:text-6xl xl:text-7xl">
            Home &amp; Beyond
          </h1>

          <p className="animate-fade-in-up delay-400 mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-50 drop-shadow-[0_4px_20px_rgba(2,6,23,0.98)]">
            Four ways to explore space in one place. Daily imagery, a searchable media archive, live
            Earth views, and near-Earth asteroid tracking.
          </p>

          <div className="animate-fade-in-up delay-550 mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/wonders-of-the-universe"
              className="group relative min-w-62 overflow-hidden rounded-full border border-cyan-300/55 bg-slate-950/50 px-9 py-4.5 font-nasa text-xs uppercase tracking-[0.2em] text-cyan-50 shadow-[0_0_0_1px_rgba(34,211,238,0.12),0_16px_46px_rgba(8,145,178,0.24)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-cyan-200/80 hover:text-white hover:shadow-[0_0_0_1px_rgba(34,211,238,0.2),0_22px_60px_rgba(34,211,238,0.3)]"
            >
              <span className="absolute inset-0 bg-linear-to-r from-cyan-500/22 via-sky-400/14 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="absolute inset-y-1 left-1 w-18 rounded-full bg-cyan-300/18 blur-md transition-all duration-300 group-hover:w-24 group-hover:bg-cyan-200/26" />
              <span className="relative z-10">Enter the Observatory</span>
            </Link>
            <Link
              to="/asteroid-watch"
              className="group relative min-w-52 overflow-hidden rounded-full border border-amber-300/65 bg-slate-950/42 px-9 py-4.5 font-nasa text-xs uppercase tracking-[0.2em] text-amber-200 shadow-[0_12px_34px_rgba(245,158,11,0.1)] transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-200/85 hover:bg-amber-500/14 hover:text-amber-50 hover:shadow-[0_18px_46px_rgba(245,158,11,0.16)]"
            >
              <span className="absolute inset-0 bg-linear-to-r from-amber-400/10 via-transparent to-amber-300/8 opacity-50 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="relative z-10">Asteroid Watch</span>
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="animate-fade-in-up delay-800 mt-16 flex flex-col items-center">
            <ChevronDown className="animate-float h-4 w-4 text-slate-500 [animation-delay:0ms]" />
            <ChevronDown className="animate-float -mt-1 h-4 w-4 text-slate-500/80 [animation-delay:150ms]" />
            <ChevronDown className="animate-float -mt-1 h-4 w-4 text-slate-500/60 [animation-delay:300ms]" />
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="relative z-20 border-y border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 py-8 sm:grid-cols-4 sm:px-6 lg:px-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-nasa text-2xl tracking-wider text-slate-900 dark:text-white sm:text-3xl">
                {s.value}
              </p>
              <p className="mt-1 text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className="relative z-10 bg-white py-20 dark:bg-slate-950/65 sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.06),transparent)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="font-nasa text-sm uppercase tracking-[0.3em] text-cyan-400 dark:text-cyan-400">
              Explore
            </h2>
            <p className="mt-4 font-nasa text-3xl tracking-wide text-slate-900 dark:text-white sm:text-4xl">
              Four cosmic feeds - one universe.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {features.map((f) => (
              <Link
                key={f.to}
                to={f.to}
                className={`card-glow ${f.glow} group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950/65 dark:shadow-none ${f.borderHover}`}
              >
                {/* Thumbnail */}
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={f.image}
                    alt={f.imageAlt}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  {/* Gradient fade into card body */}
                  <div className="absolute inset-0 bg-linear-to-t from-white/80 via-transparent to-transparent dark:from-slate-900/80" />

                  {/* Badge overlaid on thumbnail */}
                  <span
                    className={`absolute left-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full ${f.badgeBg} px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm`}
                  >
                    <f.Icon className="h-3 w-3" />
                    {f.label}
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {f.title}
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                    {f.description}
                  </p>

                  <span
                    className={`mt-4 inline-flex w-fit items-center gap-2 text-sm font-medium transition-colors ${f.exploreColor}`}
                  >
                    Explore
                    <svg
                      className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 12h14M12 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
