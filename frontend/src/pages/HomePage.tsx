import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function HomePage() {
  useEffect(() => {
    document.title = 'Home & Beyond'
  }, [])

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[24rem] bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.12),_transparent_45%),radial-gradient(circle_at_top_right,_rgba(15,23,42,0.08),_transparent_35%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(96,165,250,0.14),_transparent_38%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.12),_transparent_30%)]" />

      <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-center">
          <div className="max-w-3xl">
            <p className="font-nasa text-xs uppercase tracking-[0.26em] text-blue-600 dark:text-blue-400">
              NASA Data Explorer
            </p>
            <h1 className="mt-5 font-nasa text-4xl leading-[1.05] tracking-[0.12em] text-slate-950 dark:text-white sm:text-5xl xl:text-6xl">
              Home &amp; Beyond
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-9 text-slate-600 dark:text-slate-300">
              A space-focused web experience built around NASA&apos;s open APIs. Start with a
              cinematic Astronomy Picture of the Day journey and explore daily stories, imagery, and
              discoveries through a homepage that stays useful as the collection grows.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/wonders-of-the-universe"
                className="rounded-full bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              >
                Enter Wonders of the Universe
              </Link>
              <div className="rounded-full border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-600 backdrop-blur dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300">
                Start with one curated journey and keep exploring.
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white/90 p-6 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.55)] backdrop-blur dark:border-slate-800 dark:bg-slate-900/85">
            <div className="flex items-center justify-between gap-4">
              <p className="font-nasa text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                Featured destination
              </p>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/40 dark:text-emerald-300">
                Explore
              </span>
            </div>
            <h2 className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">
              Wonders of the Universe
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
              An Astronomy Picture of the Day experience built around a featured story, a browsable
              archive, rich detail views, and a calmer editorial rhythm than a plain image feed.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  Experience
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                  Featured APOD stories with archive exploration and immersive detail views
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/50">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  Highlights
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                  Featured daily image, archive filters, smooth browsing, responsive reading
                </p>
              </div>
            </div>
            <Link
              to="/wonders-of-the-universe"
              className="mt-6 inline-flex rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:text-white dark:hover:border-blue-500 dark:hover:text-blue-300"
            >
              Explore Wonders
            </Link>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="font-nasa text-xs uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">
              Daily discovery
            </p>
            <h3 className="mt-4 text-xl font-semibold text-slate-950 dark:text-white">
              Begin with a story, not just a thumbnail
            </h3>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Wonders of the Universe is designed to feel editorial and immersive, with a featured
              moment up front and a deeper archive waiting below.
            </p>
          </article>

          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="font-nasa text-xs uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">
              Guided exploration
            </p>
            <h3 className="mt-4 text-xl font-semibold text-slate-950 dark:text-white">
              Step from the homepage into deeper space stories
            </h3>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
              The homepage gives the product a clear front door while each destination can build its
              own identity, mood, and way of exploring NASA&apos;s data.
            </p>
          </article>

          <article className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="font-nasa text-xs uppercase tracking-[0.22em] text-blue-600 dark:text-blue-400">
              What this space offers
            </p>
            <h3 className="mt-4 text-xl font-semibold text-slate-950 dark:text-white">
              Designed for return visits, not just a single click-through
            </h3>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Daily updates, archive browsing, richer context, and polished reading flow turn the
              homepage into an invitation rather than a handoff page.
            </p>
          </article>
        </div>

        <div className="grid gap-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="font-nasa text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              Coming next
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">
              A homepage built to welcome new space experiences
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              Home &amp; Beyond is designed as a lasting entry point: strong enough to stand on its
              own now, and flexible enough to keep welcoming new journeys without losing clarity or
              character.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-slate-600 dark:text-slate-300 sm:grid-cols-3 lg:min-w-[22rem] lg:grid-cols-1">
            <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950/50">
              1. Discover a calm, curated starting point
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950/50">
              2. Enter focused destinations with their own character
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 dark:bg-slate-950/50">
              3. Return whenever new explorations arrive
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
