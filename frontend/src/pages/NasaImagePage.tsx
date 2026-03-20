import { Suspense, lazy, useEffect, useState } from 'react'
import { Image as ImageIcon, Play, Search, Shapes, X } from 'lucide-react'
import { useNasaImage } from '@/hooks/useNasaImage'
import InlineErrorNotice from '@/components/Feedback/InlineErrorNotice'
import LoadMoreButton from '@/components/Wonders/LoadMoreButton'
import ImageCard from '@/components/NasaImage/ImageCard'
import ImageCardSkeleton from '@/components/NasaImage/ImageCardSkeleton'
import SegmentedControl from '@/components/Wonders/SegmentedControl'
import FilterChipButton from '@/components/Wonders/FilterChipButton'
import {
  nasaImageEmptyDescription,
  nasaImageEmptyTitle,
  nasaImageInitialResultSkeletonCount,
  nasaImageIntro,
  nasaImagePopularSearchLabel,
  nasaImageSuggestions,
} from '@/content/nasaImageContent'
import { WONDERS_MEDIA_GRID_CLASS } from '@/lib/wondersLayout'
import type { NasaImageItem } from '@/types/nasaImage'

const ImageModal = lazy(() => import('@/components/NasaImage/ImageModal'))

export default function NasaImagePage() {
  const [searchInput, setSearchInput] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [mediaType, setMediaType] = useState('')

  const { items, totalHits, loading, error, hasMore, loadMore } = useNasaImage({
    query: activeQuery,
    mediaType: mediaType || undefined,
  })

  const [selectedItem, setSelectedItem] = useState<NasaImageItem | null>(null)
  const mediaSelection = (mediaType || 'all') as 'all' | 'image' | 'video'
  const isSearchingInitialResults = loading && !!activeQuery && items.length === 0

  useEffect(() => {
    document.title = 'NASA Image Library | Wonders of the Universe | Home & Beyond'
  }, [])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (searchInput.trim()) setActiveQuery(searchInput.trim())
  }

  function handleSuggestion(query: string) {
    setSearchInput(query)
    setActiveQuery(query)
  }

  function handleClearSearch() {
    setSearchInput('')
    setActiveQuery('')
  }

  return (
    <>
      <div className="mb-8">
        <p className="max-w-4xl text-base leading-8 text-slate-500 dark:text-slate-400">
          {nasaImageIntro}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mb-8 rounded-[28px] border border-slate-200 bg-white/82 p-5 shadow-[0_18px_54px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/55 dark:shadow-[0_20px_60px_rgba(2,6,23,0.3)]"
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
          <div className="flex flex-1 flex-col gap-1.5">
            <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              Search
            </label>
            <div className="relative w-full">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="e.g. nebula, apollo 11, saturn..."
                className="h-12 w-full min-w-50 rounded-2xl border border-slate-200 bg-white/90 px-4 pr-11 text-base text-slate-700 transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-[#0B3D91] focus:outline-none dark:border-slate-800 dark:bg-slate-950/55 dark:text-slate-200 dark:placeholder:text-slate-500 dark:hover:border-slate-700 dark:focus:border-[#8CB8FF]"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 z-10 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              Media
            </label>
            <SegmentedControl
              legend="Filter by media type"
              value={mediaSelection}
              onChange={(value) => setMediaType(value === 'all' ? '' : value)}
              options={[
                { value: 'all', label: 'All', icon: <Shapes size={14} /> },
                { value: 'image', label: 'Image', icon: <ImageIcon size={14} /> },
                { value: 'video', label: 'Video', icon: <Play size={14} /> },
              ]}
            />
          </div>

          <button
            type="submit"
            className="cosmic-btn-primary flex h-12 items-center justify-center gap-1.5 rounded-2xl px-5 text-sm font-medium"
          >
            <Search size={14} />
            Search
          </button>
        </div>
      </form>

      {!activeQuery && (
        <div className="rounded-[28px] border border-slate-200 bg-white/60 px-6 py-12 shadow-[0_14px_40px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-900/35 dark:shadow-none">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
              {nasaImageEmptyTitle}
            </p>
            <p className="mt-2 text-base leading-7 text-slate-500 dark:text-slate-400">
              {nasaImageEmptyDescription}
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-xl">
            <p className="mb-3 text-center text-xs font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              {nasaImagePopularSearchLabel}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {nasaImageSuggestions.map((s) => (
                <FilterChipButton key={s.query} onClick={() => handleSuggestion(s.query)}>
                  {s.label}
                </FilterChipButton>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && (
        <InlineErrorNotice className="mb-6" title="Unable to load image results" message={error} />
      )}

      {activeQuery && !loading && items.length === 0 && !error && (
        <div className="py-20 text-center text-slate-500 dark:text-slate-400">
          No results found for &ldquo;{activeQuery}&rdquo;. Try a different search term.
        </div>
      )}

      {activeQuery && (totalHits > 0 || isSearchingInitialResults) && (
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="ui-kicker">Archive</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
              Search results
            </h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {isSearchingInitialResults ? (
              <>Searching for &ldquo;{activeQuery}&rdquo;...</>
            ) : (
              <>
                {totalHits.toLocaleString()} result{totalHits === 1 ? '' : 's'} for &ldquo;
                {activeQuery}&rdquo;
              </>
            )}
          </p>
        </div>
      )}

      <div aria-live="polite" className="sr-only">
        {loading
          ? 'Loading search results...'
          : activeQuery && totalHits > 0
            ? `Search complete, ${totalHits} results found`
            : ''}
      </div>
      <div className={WONDERS_MEDIA_GRID_CLASS}>
        {items.map((item) => (
          <ImageCard key={item.nasa_id} item={item} onClick={setSelectedItem} />
        ))}
        {loading &&
          Array.from({ length: items.length === 0 ? nasaImageInitialResultSkeletonCount : 4 }).map(
            (_, i) => <ImageCardSkeleton key={`skeleton-${i}`} />,
          )}
      </div>

      {!loading && hasMore && items.length > 0 && <LoadMoreButton onClick={loadMore} />}

      {selectedItem && (
        <Suspense fallback={null}>
          <ImageModal item={selectedItem} onClose={() => setSelectedItem(null)} />
        </Suspense>
      )}
    </>
  )
}
