export default function ImageCardSkeleton() {
  return (
    <div className="relative aspect-9/16 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
      <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-800" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-300 dark:bg-slate-700" />
        <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-slate-300 dark:bg-slate-700" />
      </div>
    </div>
  )
}
