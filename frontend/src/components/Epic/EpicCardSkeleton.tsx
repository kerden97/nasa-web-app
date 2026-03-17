import MediaBadge from '@/components/Wonders/MediaBadge'

export default function EpicCardSkeleton() {
  return (
    <div className="relative aspect-9/16 w-full overflow-hidden rounded-[24px] border border-slate-200 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.08)] dark:border-slate-800/80 dark:bg-slate-900/70 dark:shadow-[0_22px_56px_rgba(2,6,23,0.35)]">
      <div className="absolute inset-0 bg-slate-950" />
      <div className="absolute inset-x-0 top-0 h-[58%] animate-pulse bg-slate-900/84" />

      <MediaBadge kind="EPIC" cardStyle className="absolute left-3 top-3 opacity-90" />

      <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/78 via-45% to-slate-950/6" />

      <div className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-20">
        <div className="h-4 w-40 animate-pulse rounded bg-slate-300 dark:bg-slate-700" />

        <div className="mt-3 space-y-2">
          <div className="h-5 w-[78%] animate-pulse rounded bg-slate-300 dark:bg-slate-700" />
          <div className="h-5 w-[60%] animate-pulse rounded bg-slate-300 dark:bg-slate-700" />
        </div>

        <div className="mt-4 space-y-2">
          <div className="h-3.5 w-[82%] animate-pulse rounded bg-slate-300 dark:bg-slate-700" />
          <div className="h-3.5 w-[42%] animate-pulse rounded bg-slate-300 dark:bg-slate-700" />
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div className="h-3 w-24 animate-pulse rounded bg-slate-300 dark:bg-slate-700" />
          <span className="whitespace-nowrap rounded-full border border-white/14 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-white/90">
            View details
          </span>
        </div>
      </div>
    </div>
  )
}
