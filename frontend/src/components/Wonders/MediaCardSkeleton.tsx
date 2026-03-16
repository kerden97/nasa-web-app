interface MediaCardSkeletonProps {
  teaser?: boolean
  footerButton?: boolean
}

export default function MediaCardSkeleton({
  teaser = false,
  footerButton = true,
}: MediaCardSkeletonProps) {
  return (
    <div className="relative aspect-9/16 w-full overflow-hidden rounded-[24px] border border-slate-200 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-slate-800/80 dark:bg-slate-900/70 dark:shadow-[0_22px_56px_rgba(2,6,23,0.35)]">
      <div className="absolute inset-0 animate-pulse bg-slate-200 dark:bg-slate-800" />
      <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/78 via-45% to-slate-950/6" />
      <div className="absolute left-3 top-3 h-7 w-16 rounded-full bg-slate-300/90 dark:bg-slate-700/90" />
      <div className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-20">
        <div className="h-3 w-32 animate-pulse rounded bg-slate-300 dark:bg-slate-700" />
        <div className="mt-3 h-7 w-4/5 animate-pulse rounded bg-slate-300 dark:bg-slate-700" />
        {teaser && (
          <>
            <div className="mt-3 h-3 w-full animate-pulse rounded bg-slate-300 dark:bg-slate-700" />
            <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-slate-300 dark:bg-slate-700" />
          </>
        )}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="h-3 w-24 animate-pulse rounded bg-slate-300 dark:bg-slate-700" />
          {footerButton ? (
            <div className="h-8 w-24 animate-pulse rounded-full bg-slate-300 dark:bg-slate-700" />
          ) : (
            <div className="h-3 w-20 animate-pulse rounded bg-slate-300 dark:bg-slate-700" />
          )}
        </div>
      </div>
    </div>
  )
}
