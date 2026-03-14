import { useEffect, useState } from 'react'
import { useApod } from '@/hooks/useApod'
import { useGridSize } from '@/hooks/useGridSize'
import ApodCard from '@/components/Apod/ApodCard'
import ApodCardSkeleton from '@/components/Apod/ApodCardSkeleton'
import ApodModal from '@/components/Apod/ApodModal'
import DateFilter from '@/components/Apod/DateFilter'
import FeaturedApodHero from '@/components/Apod/FeaturedApodHero'
import FeaturedApodHeroSkeleton from '@/components/Apod/FeaturedApodHeroSkeleton'
import type { ApodItem } from '@/types/apod'

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

  const isFiltered = !!(filter.date || filter.startDate)
  const featuredItem = items[0] ?? null
  const archiveItems = featuredItem && !isFiltered ? items.slice(1) : items

  return (
    <>
      <p className="mb-6 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
        Discover daily cosmic stories with richer context, credits, and a closer look at the images
        behind NASA&apos;s APOD archive.
      </p>

      {!loading && items.length === 0 && !error && (
        <div className="py-20 text-center text-slate-500 dark:text-slate-400">
          No results found for the selected date.
        </div>
      )}

      {loading && items.length === 0 && !isFiltered && <FeaturedApodHeroSkeleton />}

      {featuredItem && !loading && !error && !isFiltered && (
        <FeaturedApodHero item={featuredItem} onOpen={setSelectedItem} />
      )}

      {(archiveItems.length > 0 || loading || error) && (
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <p className="font-nasa text-xs uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
              Archive
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-900 dark:text-white">
              Browse recent discoveries
            </h2>
          </div>
          {archiveItems.length > 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {archiveItems.length} item{archiveItems.length === 1 ? '' : 's'}
            </p>
          )}
        </div>
      )}

      <div className="mb-6">
        <DateFilter
          isFiltered={isFiltered}
          onSingleDate={(date) => setFilter({ date })}
          onDateRange={(startDate, endDate) => setFilter({ startDate, endDate })}
          onReset={() => setFilter({})}
        />
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
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
            className="rounded-lg border border-slate-200 px-6 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Load more
          </button>
        </div>
      )}

      {selectedItem && <ApodModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </>
  )
}
