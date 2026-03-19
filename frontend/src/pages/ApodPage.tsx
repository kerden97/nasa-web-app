import { Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { Image as ImageIcon, Play, Shapes } from 'lucide-react'
import { useApod } from '@/hooks/useApod'
import { useGridSize } from '@/hooks/useGridSize'
import ApodCard from '@/components/Apod/ApodCard'
import ApodCardSkeleton from '@/components/Apod/ApodCardSkeleton'
import ApodInitialLoadingState from '@/components/Apod/ApodInitialLoadingState'
import DateFilter from '@/components/Apod/DateFilter'
import FeaturedApodHero from '@/components/Apod/FeaturedApodHero'
import InlineErrorNotice from '@/components/Feedback/InlineErrorNotice'
import SegmentedControl from '@/components/Wonders/SegmentedControl'
import type { ApodItem } from '@/types/apod'

const ApodModal = lazy(() => import('@/components/Apod/ApodModal'))

export default function ApodPage() {
  useEffect(() => {
    document.title = 'APOD | Wonders of the Universe | Home & Beyond'
  }, [])

  const [filter, setFilter] = useState<{
    date?: string
    startDate?: string
    endDate?: string
  }>({})

  const { pageSize } = useGridSize()
  const { items, loading, error, loadMore, hasMore } = useApod({
    ...filter,
    pageSize,
  })
  const [selectedItem, setSelectedItem] = useState<ApodItem | null>(null)
  const [mediaFilter, setMediaFilter] = useState<'all' | 'image' | 'video'>('all')

  const isFiltered = !!(filter.date || filter.startDate)
  const visibleItems = useMemo(
    () => items.filter((item) => mediaFilter === 'all' || item.media_type === mediaFilter),
    [items, mediaFilter],
  )
  const featuredItem = visibleItems[0] ?? null
  const archiveItems = featuredItem && !isFiltered ? visibleItems.slice(1) : visibleItems

  if (loading && items.length === 0 && !isFiltered) {
    return <ApodInitialLoadingState />
  }

  return (
    <>
      {!loading && items.length === 0 && !error && (
        <div className="rounded-[28px] border border-slate-200 bg-white/80 py-20 text-center text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900/45 dark:text-slate-400">
          No results found for the selected date.
        </div>
      )}

      {featuredItem && !loading && !error && !isFiltered && (
        <FeaturedApodHero item={featuredItem} onOpen={setSelectedItem} />
      )}

      {(archiveItems.length > 0 || loading || error) && (
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
          <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            {archiveItems.length > 0 && (
              <p>
                {archiveItems.length} item{archiveItems.length === 1 ? '' : 's'}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between lg:gap-4">
        <div className="min-w-0 flex-1">
          <DateFilter
            isFiltered={isFiltered}
            onSingleDate={(date) => setFilter({ date })}
            onDateRange={(startDate, endDate) => setFilter({ startDate, endDate })}
            onReset={() => setFilter({})}
          />
        </div>

        <div className="self-start lg:shrink-0 lg:self-auto">
          <SegmentedControl
            className="w-fit p-0.5 [&_button]:h-8 [&_button]:min-w-19 [&_button]:px-3 [&_button]:text-xs"
            value={mediaFilter}
            onChange={setMediaFilter}
            options={[
              { value: 'image', label: 'Image', icon: <ImageIcon size={13} /> },
              { value: 'video', label: 'Video', icon: <Play size={13} /> },
              { value: 'all', label: 'All', icon: <Shapes size={13} /> },
            ]}
          />
        </div>
      </div>

      {error && (
        <InlineErrorNotice
          className="mb-6"
          title="Unable to load the APOD archive"
          message={error}
        />
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {archiveItems.map((item) => (
          <ApodCard key={item.date} item={item} onClick={setSelectedItem} />
        ))}
        {loading &&
          Array.from({ length: items.length === 0 ? pageSize : 4 }).map((_, i) => (
            <ApodCardSkeleton key={`skeleton-${i}`} />
          ))}
      </div>

      {!loading && hasMore && items.length > 0 && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadMore}
            className="cosmic-btn-load-more rounded-full px-6 py-3 text-sm font-semibold"
          >
            Load more
          </button>
        </div>
      )}

      {selectedItem && (
        <Suspense fallback={null}>
          <ApodModal item={selectedItem} onClose={() => setSelectedItem(null)} />
        </Suspense>
      )}
    </>
  )
}
