import ApodCardSkeleton from '@/components/Apod/ApodCardSkeleton'
import FeaturedApodHeroSkeleton from '@/components/Apod/FeaturedApodHeroSkeleton'

interface ApodInitialLoadingStateProps {
  cardCount?: number
}

export default function ApodInitialLoadingState({ cardCount = 20 }: ApodInitialLoadingStateProps) {
  return (
    <>
      <FeaturedApodHeroSkeleton />

      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="ui-kicker">Archive</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl">
            Browse recent discoveries
          </h2>
          <p className="mt-2 text-base leading-7 text-slate-600 dark:text-slate-400">
            Jump through recent APOD entries with quick presets or a custom date range.
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            {[
              'w-[4.5rem]',
              'w-[6rem]',
              'w-[6.25rem]',
              'w-[6.5rem]',
              'w-[6.9rem]',
              'w-[6.25rem]',
              'w-[6.2rem]',
            ].map((widthClass, index) => (
              <div
                key={index}
                className={`h-10 animate-pulse rounded-2xl border border-slate-200 bg-white/82 dark:border-slate-800 dark:bg-slate-900/58 ${widthClass}`}
              />
            ))}
          </div>
        </div>

        <div className="self-start lg:shrink-0 lg:self-auto">
          <div className="inline-flex h-10 w-[15.2rem] animate-pulse rounded-2xl border border-slate-200 bg-white/82 p-0.5 shadow-[0_16px_36px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-slate-800/90 dark:bg-slate-900/72 dark:shadow-[0_14px_32px_rgba(2,6,23,0.18)]">
            <div className="grid h-full w-full grid-cols-3 gap-1">
              <div className="rounded-xl bg-slate-200 dark:bg-slate-800" />
              <div className="rounded-xl bg-slate-200 dark:bg-slate-800" />
              <div className="rounded-xl bg-slate-200 dark:bg-slate-800" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: cardCount }).map((_, index) => (
          <ApodCardSkeleton key={index} />
        ))}
      </div>
    </>
  )
}
