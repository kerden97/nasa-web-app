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
import EmptyState from '@/components/Wonders/EmptyState'
import LoadMoreButton from '@/components/Wonders/LoadMoreButton'
import SectionHeader from '@/components/Wonders/SectionHeader'
import SegmentedControl from '@/components/Wonders/SegmentedControl'
import { WONDERS_MEDIA_GRID_CLASS } from '@/lib/wondersLayout'
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
        <EmptyState>No results found for the selected date.</EmptyState>
      )}

      {featuredItem && !loading && !error && !isFiltered && (
        <FeaturedApodHero item={featuredItem} onOpen={setSelectedItem} />
      )}

      {(archiveItems.length > 0 || loading || error) && (
        <SectionHeader
          kicker="Archive"
          title="Browse recent discoveries"
          description="Jump through recent APOD entries with quick presets or a custom date range."
        >
          {archiveItems.length > 0 && (
            <p>
              {archiveItems.length} item{archiveItems.length === 1 ? '' : 's'}
            </p>
          )}
        </SectionHeader>
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
            legend="Filter by media type"
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

      <div aria-live="polite" className="sr-only">
        {loading
          ? 'Loading APOD entries...'
          : `${visibleItems.length} item${visibleItems.length === 1 ? '' : 's'} loaded`}
      </div>
      <div className={WONDERS_MEDIA_GRID_CLASS}>
        {archiveItems.map((item) => (
          <ApodCard key={item.date} item={item} onClick={setSelectedItem} />
        ))}
        {loading &&
          Array.from({ length: items.length === 0 ? pageSize : 4 }).map((_, i) => (
            <ApodCardSkeleton key={`skeleton-${i}`} />
          ))}
      </div>

      {!loading && hasMore && items.length > 0 && <LoadMoreButton onClick={loadMore} />}

      {selectedItem && (
        <Suspense fallback={null}>
          <ApodModal item={selectedItem} onClose={() => setSelectedItem(null)} />
        </Suspense>
      )}
    </>
  )
}
