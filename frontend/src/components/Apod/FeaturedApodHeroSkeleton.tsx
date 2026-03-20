export default function FeaturedApodHeroSkeleton() {
  return (
    <section className="relative mb-12 overflow-hidden rounded-4xl border border-slate-200 bg-white/95 shadow-[0_28px_90px_rgba(15,23,42,0.1)] dark:border-slate-800/80 dark:bg-slate-900/70 dark:shadow-[0_30px_90px_rgba(2,6,23,0.45)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(11,61,145,0.16),transparent_30%),radial-gradient(circle_at_85%_85%,rgba(99,102,241,0.12),transparent_28%)]" />

      <div className="relative grid lg:h-130 lg:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.95fr)]">
        <div className="relative h-67 overflow-hidden bg-slate-200 dark:bg-slate-800 sm:h-82 lg:h-130">
          <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-800" />
          <div className="absolute inset-0 bg-linear-to-tr from-slate-950/18 via-transparent to-[#0B3D91]/10" />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/72 via-slate-950/18 to-transparent" />
          <div className="absolute left-5 top-5 rounded-full border border-amber-300/30 bg-amber-400/16 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-amber-100 backdrop-blur-sm">
            Today&apos;s pick
          </div>
        </div>

        <div className="relative flex flex-col overflow-hidden p-6 lg:h-130 lg:min-h-0 lg:p-7">
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-[#0B3D91]/12 blur-3xl" />

          <div className="min-h-0 flex-1 overflow-hidden">
            <div className="flex flex-wrap items-center gap-2">
              <div className="h-8 w-47 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="h-8 w-23 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>

            <div className="mt-4 h-13 w-[86%] max-w-88 animate-pulse rounded bg-slate-200 dark:bg-slate-700 sm:h-16.25" />
            <div className="mt-3 h-4 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />

            <div className="mt-4 space-y-3">
              <div className="h-3.5 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-3.5 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-3.5 w-10/12 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="hidden lg:block lg:space-y-3">
                <div className="h-3.5 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-3.5 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                <div className="h-3.5 w-10/12 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>
          </div>

          <div className="mt-6 flex shrink-0 flex-col gap-4 border-t border-slate-200 pt-4 dark:border-slate-800 sm:mt-auto sm:flex-row sm:items-end sm:justify-between sm:gap-6">
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                Credit
              </p>
              <div className="mt-2 h-4 w-38 max-w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
            <span className="cosmic-btn-primary block shrink-0 whitespace-nowrap rounded-full px-6 py-3 text-center text-sm font-semibold sm:inline-block">
              View details
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
