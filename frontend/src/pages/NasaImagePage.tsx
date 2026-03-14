import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useNasaImage } from '@/hooks/useNasaImage'
import ImageCard from '@/components/NasaImage/ImageCard'
import ImageCardSkeleton from '@/components/NasaImage/ImageCardSkeleton'
import ImageModal from '@/components/NasaImage/ImageModal'
import type { NasaImageItem } from '@/types/nasaImage'

const SUGGESTIONS = [
  { label: 'Nebula', query: 'nebula' },
  { label: 'Apollo 11', query: 'apollo 11' },
  { label: 'ISS', query: 'international space station' },
  { label: 'Saturn', query: 'saturn' },
  { label: 'Hubble', query: 'hubble deep field' },
]

export default function NasaImagePage() {
  const [searchInput, setSearchInput] = useState('')
  const [activeQuery, setActiveQuery] = useState('')
  const [mediaType, setMediaType] = useState('')

  const { items, totalHits, loading, error, hasMore, loadMore } = useNasaImage({
    query: activeQuery,
    mediaType: mediaType || undefined,
  })

  const [selectedItem, setSelectedItem] = useState<NasaImageItem | null>(null)

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

  const selectBase =
    'h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 transition-colors hover:border-slate-300 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-slate-600 dark:focus:border-blue-500'

  return (
    <>
      <p className="mb-6 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
        Search NASA&apos;s vast image and video archive. Explore launches, planets, nebulae,
        missions, and more from across the history of space exploration.
      </p>

      <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap items-end gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            Search
          </label>
          <div className="relative w-full">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="e.g. nebula, apollo 11, saturn..."
              className="h-10 w-full min-w-[200px] rounded-lg border border-slate-200 bg-white px-3 pr-11 text-sm text-slate-700 transition-colors placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder:text-slate-500 dark:hover:border-slate-600 dark:focus:border-blue-500"
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

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            Media
          </label>
          <select
            value={mediaType}
            onChange={(e) => setMediaType(e.target.value)}
            className={selectBase}
          >
            <option value="">All types</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
          </select>
        </div>

        <button
          type="submit"
          className="flex h-10 items-center gap-1.5 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition-colors hover:bg-blue-500"
        >
          <Search size={14} />
          Search
        </button>
      </form>

      {!activeQuery && (
        <div className="py-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
              Search NASA&apos;s image archive
            </p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Over 140,000 images, videos, and audio files from NASA&apos;s missions and
              discoveries.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-xl">
            <p className="mb-3 text-center text-xs font-medium uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              Popular searches
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s.query}
                  type="button"
                  onClick={() => handleSuggestion(s.query)}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:text-blue-400"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </div>
      )}

      {activeQuery && !loading && items.length === 0 && !error && (
        <div className="py-20 text-center text-slate-500 dark:text-slate-400">
          No results found for &ldquo;{activeQuery}&rdquo;. Try a different search term.
        </div>
      )}

      {activeQuery && totalHits > 0 && (
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          {totalHits.toLocaleString()} result{totalHits === 1 ? '' : 's'} for &ldquo;
          {activeQuery}&rdquo;
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <ImageCard key={item.nasa_id} item={item} onClick={setSelectedItem} />
        ))}
        {loading &&
          Array.from({ length: items.length === 0 ? 12 : 4 }).map((_, i) => (
            <ImageCardSkeleton key={`skeleton-${i}`} />
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

      {selectedItem && <ImageModal item={selectedItem} onClose={() => setSelectedItem(null)} />}
    </>
  )
}
