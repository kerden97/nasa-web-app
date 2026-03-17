import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import Starfield from '@/components/Starfield/Starfield'
import { homeFeatures, homeHeroImage, homeStats } from '@/content/homeContent'

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
          src={homeHeroImage}
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
          <p className="animate-fade-in-up delay-100 ui-kicker text-[0.8rem] text-[#7FB2FF]! drop-shadow-[0_2px_18px_rgba(2,6,23,1)] dark:text-[#8CB8FF]!">
            NASA Open-Data Explorer
          </p>

          <h1 className="ui-page-title hero-glow animate-fade-in-up delay-250 mt-6 text-5xl leading-[1.05] text-[#B5CFFF] drop-shadow-[0_4px_24px_rgba(2,6,23,0.9)] sm:text-6xl xl:text-7xl">
            Home &amp; Beyond
          </h1>

          <p className="animate-fade-in-up delay-400 mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-slate-50 drop-shadow-[0_4px_20px_rgba(2,6,23,0.98)]">
            Four ways to explore space in one place. Daily imagery, a searchable media archive, live
            Earth views, and near-Earth asteroid tracking.
          </p>

          <div className="animate-fade-in-up delay-550 mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/wonders-of-the-universe"
              className="group relative min-w-62 overflow-hidden rounded-full border border-[#0B3D91]/50 bg-slate-950/50 px-9 py-4.5 text-sm font-semibold uppercase tracking-[0.18em] text-white shadow-[0_0_0_1px_rgba(11,61,145,0.12),0_16px_46px_rgba(11,61,145,0.22)] backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 hover:border-[#8CB8FF]/70 hover:text-white hover:shadow-[0_0_0_1px_rgba(140,184,255,0.18),0_22px_60px_rgba(11,61,145,0.28)]"
            >
              <span className="absolute inset-0 bg-linear-to-r from-[#0B3D91]/22 via-[#0B3D91]/12 to-transparent opacity-90 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="absolute inset-y-1 left-1 w-18 rounded-full bg-[#8CB8FF]/16 blur-md transition-all duration-300 group-hover:w-24 group-hover:bg-[#8CB8FF]/24" />
              <span className="relative z-10">Enter the Observatory</span>
            </Link>
            <Link
              to="/asteroid-watch"
              className="group relative min-w-52 overflow-hidden rounded-full border border-amber-300/65 bg-slate-950/42 px-9 py-4.5 text-sm font-semibold uppercase tracking-[0.18em] text-amber-200 shadow-[0_12px_34px_rgba(245,158,11,0.1)] transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-200/85 hover:bg-amber-500/14 hover:text-amber-50 hover:shadow-[0_18px_46px_rgba(245,158,11,0.16)]"
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
          {homeStats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Feature cards ── */}
      <section className="relative z-10 bg-white py-20 dark:bg-slate-950/65 sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.06),transparent)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="ui-kicker">Explore</h2>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Four cosmic feeds - one universe.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {homeFeatures.map((f) => (
              <Link
                key={f.to}
                to={f.to}
                className={`card-glow ${f.glow} group relative flex min-h-98 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm backdrop-blur-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950/65 dark:shadow-none ${f.borderHover}`}
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
                    className={`absolute left-4 top-4 z-10 inline-flex h-7 items-center gap-1.5 rounded-full ${f.badgeBg} px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white leading-none backdrop-blur-sm`}
                  >
                    <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                      <f.Icon size={11} strokeWidth={2.1} />
                    </span>
                    <span className="flex items-center pt-px">{f.label}</span>
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-6">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                    {f.title}
                  </h3>

                  <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-400">
                    {f.description}
                  </p>

                  <span
                    className={`mt-auto pt-4 inline-flex w-fit items-center gap-2 text-sm font-medium transition-colors ${f.exploreColor}`}
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
