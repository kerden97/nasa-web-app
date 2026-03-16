interface FeaturedPanelSkeletonProps {
  badgeWidthClass?: string
  metaWidthClass?: string
  secondaryMetaWidthClass?: string
  titleWidthClass?: string
  descriptionLines?: number
  footerCtaWidthClass?: string
}

export default function FeaturedPanelSkeleton({
  badgeWidthClass = 'w-32',
  metaWidthClass = 'w-46',
  secondaryMetaWidthClass = 'w-18',
  titleWidthClass = 'w-4/5',
  descriptionLines = 5,
  footerCtaWidthClass = 'w-40',
}: FeaturedPanelSkeletonProps) {
  return (
    <section className="relative mb-12 overflow-hidden rounded-[32px] border border-slate-200 bg-white/95 shadow-[0_28px_90px_rgba(15,23,42,0.1)] dark:border-slate-800/80 dark:bg-slate-900/70 dark:shadow-[0_30px_90px_rgba(2,6,23,0.45)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_30%),radial-gradient(circle_at_85%_85%,rgba(168,85,247,0.12),transparent_28%)]" />
      <div className="relative grid lg:h-[32.5rem] lg:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.95fr)]">
        <div className="relative min-h-[30rem] overflow-hidden bg-slate-200 dark:bg-slate-800 sm:min-h-[21rem] lg:h-[32.5rem]">
          <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-800" />
          <div className="absolute inset-0 bg-linear-to-tr from-slate-950/12 via-transparent to-cyan-400/6" />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/40 via-slate-950/12 to-transparent" />
          <div
            className={`absolute left-5 top-5 h-8 rounded-full border border-amber-300/20 bg-amber-400/10 dark:bg-amber-400/12 ${badgeWidthClass}`}
          />
        </div>

        <div className="relative flex flex-col justify-between overflow-hidden p-6 lg:h-[32.5rem] lg:min-h-0 lg:p-7">
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="min-h-0">
            <div className="flex flex-wrap items-center gap-2">
              <div
                className={`h-8 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700 ${metaWidthClass}`}
              />
              <div
                className={`h-8 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700 ${secondaryMetaWidthClass}`}
              />
            </div>
            <div
              className={`mt-4 h-10 animate-pulse rounded bg-slate-200 dark:bg-slate-700 ${titleWidthClass}`}
            />
            <div className="mt-3 h-4 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-4 space-y-3">
              {Array.from({ length: descriptionLines }).map((_, index) => (
                <div
                  key={index}
                  className={`h-4 animate-pulse rounded bg-slate-200 dark:bg-slate-700 ${
                    index === descriptionLines - 1 ? 'w-10/12' : 'w-full'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="mt-6 flex shrink-0 flex-col gap-4 border-t border-slate-200 pt-4 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="h-3 w-14 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="mt-2 h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
            <div
              className={`h-11 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700 ${footerCtaWidthClass}`}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
