import { Calendar } from 'lucide-react'
import {
  asteroidWatchChartTitles,
  asteroidWatchDatePresets,
  asteroidWatchHazardousNote,
  asteroidWatchIntroPrimary,
  asteroidWatchIntroSecondary,
  asteroidWatchKicker,
  asteroidWatchScatterNote,
  asteroidWatchSummaryLabels,
  asteroidWatchTableHeaders,
  asteroidWatchTableNote,
  asteroidWatchTableTitle,
  asteroidWatchTitle,
} from '@/content/asteroidWatchContent'

const chipBase =
  'whitespace-nowrap rounded-full px-4 py-2 text-xs font-medium transition-all duration-200'
const chipIdle =
  'border border-slate-200/80 bg-white/82 text-slate-600 shadow-[0_8px_24px_rgba(15,23,42,0.04)] dark:border-slate-700/80 dark:bg-slate-950/35 dark:text-slate-400 dark:shadow-none'
const chipActive =
  'border border-[rgba(11,61,145,0.18)] bg-[rgba(11,61,145,0.08)] text-[#0B3D91] shadow-[0_10px_26px_rgba(11,61,145,0.08)] dark:border-[rgba(140,184,255,0.28)] dark:bg-[rgba(11,61,145,0.25)] dark:text-[#8CB8FF] dark:shadow-[0_14px_32px_rgba(11,61,145,0.16)]'

function HeaderSkeleton() {
  return (
    <div className="mb-6 max-w-4xl">
      <p className="ui-kicker mb-2">{asteroidWatchKicker}</p>
      <h1 className="ui-page-title text-3xl text-slate-900 dark:text-white">
        {asteroidWatchTitle}
      </h1>
      <p className="mt-3 max-w-4xl text-base leading-8 text-slate-600 dark:text-slate-400">
        {asteroidWatchIntroPrimary}
      </p>
      <p className="mt-4 max-w-4xl text-base leading-8 text-slate-500 dark:text-slate-400">
        {asteroidWatchIntroSecondary}
      </p>
    </div>
  )
}

function FilterRowSkeleton() {
  return (
    <div className="relative z-30 mb-8">
      <div className="flex flex-wrap items-center gap-2">
        {asteroidWatchDatePresets.map((label) => (
          <button
            key={label}
            type="button"
            disabled
            className={`${chipBase} ${label === 'Last 7 days' ? chipActive : chipIdle} cursor-default`}
          >
            {label}
          </button>
        ))}

        <button
          type="button"
          disabled
          className={`${chipBase} ${chipIdle} inline-flex cursor-default items-center gap-1.5`}
        >
          <Calendar size={13} />
          Custom
        </button>
      </div>
    </div>
  )
}

function StatCardSkeleton({
  label,
  valueWidthClass,
  detailWidthClass,
}: {
  label: string
  valueWidthClass: string
  detailWidthClass: string
}) {
  return (
    <div className="relative min-h-[8.5rem] overflow-hidden rounded-[26px] border border-slate-200/80 bg-white/88 p-5 shadow-[0_14px_40px_rgba(15,23,42,0.07)] dark:border-slate-800 dark:bg-slate-900/55 dark:shadow-[0_18px_46px_rgba(2,6,23,0.22)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(11,61,145,0.05),transparent_34%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(140,184,255,0.08),transparent_32%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/80 to-transparent dark:via-white/12" />
      <p className="ui-kicker text-slate-500 dark:text-slate-500">{label}</p>
      <div
        className={`mt-2 h-9 animate-pulse rounded bg-slate-200 dark:bg-slate-700 ${valueWidthClass}`}
      />
      <div
        className={`mt-2 h-4 animate-pulse rounded bg-slate-200 dark:bg-slate-700 ${detailWidthClass}`}
      />
    </div>
  )
}

function ChartCardSkeleton({
  title,
  className,
  height = 300,
  note,
}: {
  title: string
  className?: string
  height?: number
  note?: string
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/88 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900/52 dark:shadow-[0_22px_58px_rgba(2,6,23,0.22)] ${className ?? ''}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(11,61,145,0.05),transparent_24%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(140,184,255,0.08),transparent_22%)]" />
      <h2 className="relative mb-4 text-xl font-semibold text-slate-900 dark:text-white">
        {title}
      </h2>
      <div className="animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" style={{ height }} />
      {note ? (
        <p className="mt-2 text-center text-sm leading-6 text-slate-500 dark:text-slate-500">
          {note}
        </p>
      ) : null}
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="mt-8">
      <div className="overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/82 shadow-[0_18px_48px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900/45 dark:shadow-[0_20px_52px_rgba(2,6,23,0.2)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-slate-800">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {asteroidWatchTableTitle}
          </h2>
          <button
            type="button"
            disabled
            aria-label="Rows per page"
            className="inline-flex min-h-8 items-center justify-center rounded-xl border border-slate-300 bg-white/80 px-2.5 py-1.5 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-md dark:border-slate-700 dark:bg-slate-950/55 dark:text-slate-200"
          >
            <span>25</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="ml-1 h-4 w-4"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
        <div className="border-b border-slate-200 bg-slate-50/95 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/92">
          <div className="grid grid-cols-[2.4fr_1fr_1.15fr_1.25fr_.95fr_1fr] items-center gap-4 text-sm font-medium text-slate-600 dark:text-slate-400">
            {asteroidWatchTableHeaders.map((label, index) => (
              <div key={label} className={index === 0 ? '' : 'ml-auto'}>
                <span
                  className={`inline-flex items-center gap-1 ${index === 0 ? '' : 'justify-end'}`}
                >
                  {label}
                  <span className="inline-flex flex-col text-[10px] leading-none opacity-30">
                    <span>▲</span>
                    <span>▼</span>
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
        {Array.from({ length: 25 }).map((_, i) => (
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
        <div className="flex items-center justify-between gap-4 border-t border-slate-200 px-4 py-3 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <p className="text-xs text-slate-500 dark:text-slate-500">{asteroidWatchTableNote}</p>
          <div className="flex items-center gap-3 whitespace-nowrap">
            <div className="h-4 w-18 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
            <button
              type="button"
              disabled
              aria-label="Previous page"
              className="rounded-md p-1.5 opacity-30"
            >
              <ChevronIcon direction="left" />
            </button>
            <button
              type="button"
              disabled
              aria-label="Next page"
              className="rounded-md p-1.5 opacity-30"
            >
              <ChevronIcon direction="right" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`h-4 w-4 text-slate-500 dark:text-slate-400 ${
        direction === 'left' ? 'rotate-90' : '-rotate-90'
      }`}
    >
      <path
        fillRule="evenodd"
        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  )
}

export default function AsteroidWatchSkeleton() {
  return <AsteroidWatchSkeletonContent withHeader />
}

export function AsteroidWatchSkeletonContent({ withHeader = false }: { withHeader?: boolean }) {
  return (
    <>
      {withHeader && (
        <>
          <HeaderSkeleton />
          <FilterRowSkeleton />
        </>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCardSkeleton
          label={asteroidWatchSummaryLabels[0]}
          valueWidthClass="w-16"
          detailWidthClass="w-36"
        />
        <StatCardSkeleton
          label={asteroidWatchSummaryLabels[1]}
          valueWidthClass="w-28"
          detailWidthClass="w-24"
        />
        <StatCardSkeleton
          label={asteroidWatchSummaryLabels[2]}
          valueWidthClass="w-32"
          detailWidthClass="w-28"
        />
        <StatCardSkeleton
          label={asteroidWatchSummaryLabels[3]}
          valueWidthClass="w-20"
          detailWidthClass="w-24"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCardSkeleton title={asteroidWatchChartTitles[0]} height={300} />
        <ChartCardSkeleton
          title={asteroidWatchChartTitles[1]}
          height={300}
          note={asteroidWatchHazardousNote}
        />
        <ChartCardSkeleton
          title={asteroidWatchChartTitles[2]}
          className="lg:col-span-2"
          height={350}
          note={asteroidWatchScatterNote}
        />
      </div>

      <TableSkeleton />
    </>
  )
}
