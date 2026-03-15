function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="h-3 w-28 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-2.5 h-7 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      <div className="mt-2 h-4 w-36 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
    </div>
  )
}

function ChartCardSkeleton({ className, height = 300 }: { className?: string; height?: number }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 ${className ?? ''}`}
    >
      <div className="mb-4 h-5 w-44 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
      <div className="animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" style={{ height }} />
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-5 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        <div className="inline-flex h-9 w-16 animate-pulse items-center justify-center rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800">
          <div className="h-4 w-8 rounded bg-slate-200 dark:bg-slate-700" />
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="grid grid-cols-[2.4fr_1fr_1.15fr_1.25fr_.95fr_1fr] items-center gap-4">
            <div className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="ml-auto h-4 w-18 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="ml-auto h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="ml-auto h-4 w-22 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="ml-auto h-4 w-16 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <div className="ml-auto h-4 w-18 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
          </div>
        </div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="border-b border-slate-100 px-4 py-3.5 dark:border-slate-800/50">
            <div className="grid grid-cols-[2.4fr_1fr_1.15fr_1.25fr_.95fr_1fr] items-center gap-4">
              <div className="h-5 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="ml-auto h-4 w-8 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="ml-auto h-4 w-12 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="ml-auto h-4 w-14 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
              <div className="ml-auto flex justify-end">
                <div className="h-5 w-10 animate-pulse rounded-full bg-slate-200 dark:bg-slate-700" />
              </div>
              <div className="ml-auto h-4 w-20 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AsteroidWatchSkeleton() {
  return (
    <>
      {/* Stat cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCardSkeleton height={300} />
        <ChartCardSkeleton height={300} />
        <ChartCardSkeleton className="lg:col-span-2" height={350} />
      </div>

      {/* Table */}
      <TableSkeleton />
    </>
  )
}
