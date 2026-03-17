export default function FeaturedApodHeroSkeleton() {
  return (
    <section className="relative mb-12 overflow-hidden rounded-[32px] border border-slate-200 bg-white/95 shadow-[0_28px_90px_rgba(15,23,42,0.1)] dark:border-slate-800/80 dark:bg-slate-900/70 dark:shadow-[0_30px_90px_rgba(2,6,23,0.45)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(11,61,145,0.16),transparent_30%),radial-gradient(circle_at_85%_85%,rgba(99,102,241,0.12),transparent_28%)]" />

      <div className="relative grid lg:h-[32.5rem] lg:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.95fr)]">
        <div className="relative min-h-[30rem] overflow-hidden bg-slate-200 dark:bg-slate-800 sm:min-h-[21rem] lg:h-[32.5rem]">
          <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-800" />
          <div className="absolute inset-0 bg-linear-to-tr from-slate-950/18 via-transparent to-[#0B3D91]/10" />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/72 via-slate-950/18 to-transparent" />
          <div className="absolute left-5 top-5 h-8 w-[6.5rem] rounded-full border border-amber-300/30 bg-amber-400/16 backdrop-blur-sm" />
        </div>

        <div className="relative flex flex-col justify-between overflow-hidden p-6 lg:h-[32.5rem] lg:min-h-0 lg:p-7">
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-[#0B3D91]/12 blur-3xl" />

          <div className="min-h-0">
            <div className="flex flex-wrap items-center gap-2">
              <div className="h-8 w-[11.75rem] animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="h-8 w-[5.75rem] animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>

            <div className="mt-4 h-10 w-[86%] max-w-[22rem] animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-3 h-4 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />

            <div className="mt-4 space-y-4">
              <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-10/12 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>

          <div className="mt-6 flex shrink-0 flex-col gap-4 border-t border-slate-200 pt-4 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="h-3 w-14 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-2 h-4 w-[6.5rem] animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="h-11 w-[9.5rem] animate-pulse self-start rounded-full bg-slate-200 dark:bg-slate-700 sm:self-auto" />
          </div>
        </div>
      </div>
    </section>
  )
}
