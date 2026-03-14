export default function FeaturedApodHeroSkeleton() {
  return (
    <div className="mb-10 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.8fr)]">
        <div className="relative min-h-130 animate-pulse bg-slate-200 dark:bg-slate-800">
          <div className="absolute left-5 top-5 h-6 w-28 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>
        <div className="flex flex-col justify-between overflow-hidden p-6 lg:p-7">
          <div className="min-h-0">
            <div className="h-3 w-14 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-2 h-7 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-3 h-4 w-44 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-0.5 h-4 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="mt-4 space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
          <div className="mt-4 flex shrink-0 items-center justify-between">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-10 w-32 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
      </div>
    </div>
  )
}
