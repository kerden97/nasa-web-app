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
      <div className="absolute left-3 top-3 h-7 w-16 animate-pulse rounded-full bg-slate-300/90 dark:bg-slate-700/90" />
      <div className="absolute inset-x-0 bottom-0 px-2.5 pb-2.5 pt-14 lg:px-4 lg:pb-4 lg:pt-20">
        <div className="h-2.5 w-24 animate-pulse rounded bg-slate-300 dark:bg-slate-700 lg:h-3 lg:w-32" />
        <div className="mt-1 h-5 w-4/5 animate-pulse rounded bg-slate-300 dark:bg-slate-700 lg:mt-3 lg:h-7" />
        {teaser && (
          <div className="mt-1.5 hidden xl:block">
            <div className="h-3 w-full animate-pulse rounded bg-slate-300 dark:bg-slate-700" />
            <div className="mt-2 h-3 w-4/5 animate-pulse rounded bg-slate-300 dark:bg-slate-700" />
          </div>
        )}
        <div className="mt-2 flex items-center justify-between gap-2 lg:mt-3 lg:gap-3">
          <div className="h-2.5 w-16 animate-pulse rounded bg-slate-300 dark:bg-slate-700 lg:h-3 lg:w-24" />
          {footerButton ? (
            <span className="whitespace-nowrap rounded-full border border-white/14 bg-white/5 px-2 py-0.5 text-[10px] font-medium text-white/40 lg:px-3 lg:py-1.5 lg:text-[11px]">
              View details
            </span>
          ) : (
            <div className="h-2.5 w-16 animate-pulse rounded bg-slate-300 dark:bg-slate-700 lg:h-3 lg:w-20" />
          )}
        </div>
      </div>
    </div>
  )
}
