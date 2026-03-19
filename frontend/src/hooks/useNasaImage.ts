import { useCallback, useEffect, useState } from 'react'
import { fetchApi } from '@/lib/api'
import {
  createPersistedCacheKey,
  readPersistedCache,
  writePersistedCache,
} from '@/lib/persistedClientCache'
import { nasaImageSearchResultSchema } from '@/schemas/api'
import type { NasaImageItem } from '@/types/nasaImage'

interface UseNasaImageOptions {
  query: string
  mediaType?: string
  yearStart?: string
  yearEnd?: string
}

interface UseNasaImageResult {
  items: NasaImageItem[]
  totalHits: number
  loading: boolean
  error: string | null
  page: number
  hasMore: boolean
  loadMore: () => void
}

interface NasaImageSearchResult {
  items: NasaImageItem[]
  totalHits: number
}

function buildSearchCacheKey(
  query: string,
  mediaType: string | undefined,
  yearStart: string | undefined,
  yearEnd: string | undefined,
  page: number,
): string {
  return createPersistedCacheKey(
    'nasa-image',
    query,
    mediaType ?? '',
    yearStart ?? '',
    yearEnd ?? '',
    String(page),
  )
}

export function useNasaImage(options: UseNasaImageOptions): UseNasaImageResult {
  const [items, setItems] = useState<NasaImageItem[]>([])
  const [totalHits, setTotalHits] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const trimmedQuery = options.query.trim()
  const { mediaType, yearStart, yearEnd } = options
  const hasQuery = trimmedQuery.length > 0

  useEffect(() => {
    if (!hasQuery) return

    const controller = new AbortController()
    const cacheKey = buildSearchCacheKey(trimmedQuery, mediaType, yearStart, yearEnd, 1)
    const cachedResult = readPersistedCache(cacheKey, nasaImageSearchResultSchema)
    const usedCachedData = Boolean(cachedResult)

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1)
    setError(null)
    if (usedCachedData) {
      setItems(cachedResult!.items)
      setTotalHits(cachedResult!.totalHits)
      setHasMore(
        cachedResult!.items.length > 0 && cachedResult!.items.length < cachedResult!.totalHits,
      )
      setLoading(false)
    } else {
      setItems([])
      setTotalHits(0)
      setHasMore(false)
      setLoading(true)
    }

    const params: Record<string, string> = { q: trimmedQuery, page: '1' }
    if (mediaType) params.media_type = mediaType
    if (yearStart) params.year_start = yearStart
    if (yearEnd) params.year_end = yearEnd

    fetchApi('/api/nasa-image', params, controller.signal, nasaImageSearchResultSchema)
      .then((data) => {
        setItems(data.items)
        setTotalHits(data.totalHits)
        setHasMore(data.items.length > 0 && data.items.length < data.totalHits)
        writePersistedCache<NasaImageSearchResult>(cacheKey, data)
      })
      .catch((err: Error) => {
        if (err.name !== 'AbortError' && !usedCachedData) setError(err.message)
      })
      .finally(() => {
        if (!controller.signal.aborted && !usedCachedData) setLoading(false)
      })

    return () => controller.abort()
  }, [trimmedQuery, mediaType, yearStart, yearEnd, hasQuery])

  const loadMore = useCallback(() => {
    if (loading || !hasMore || !hasQuery) return

    const nextPage = page + 1
    const cacheKey = buildSearchCacheKey(trimmedQuery, mediaType, yearStart, yearEnd, nextPage)
    const cachedResult = readPersistedCache(cacheKey, nasaImageSearchResultSchema)

    if (cachedResult) {
      setItems((prev) => [...prev, ...cachedResult.items])
      setTotalHits(cachedResult.totalHits)
      setHasMore(
        cachedResult.items.length > 0 &&
          items.length + cachedResult.items.length < cachedResult.totalHits,
      )
      setPage(nextPage)
      return
    }

    setLoading(true)

    const params: Record<string, string> = {
      q: trimmedQuery,
      page: String(nextPage),
    }
    if (mediaType) params.media_type = mediaType
    if (yearStart) params.year_start = yearStart
    if (yearEnd) params.year_end = yearEnd

    fetchApi('/api/nasa-image', params, undefined, nasaImageSearchResultSchema)
      .then((data) => {
        writePersistedCache<NasaImageSearchResult>(cacheKey, data)
        setItems((prev) => {
          const updated = [...prev, ...data.items]
          setHasMore(data.items.length > 0 && updated.length < data.totalHits)
          return updated
        })
        setPage(nextPage)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [loading, hasMore, hasQuery, items.length, page, trimmedQuery, mediaType, yearStart, yearEnd])

  return {
    items: hasQuery ? items : [],
    totalHits: hasQuery ? totalHits : 0,
    loading: hasQuery ? loading : false,
    error: hasQuery ? error : null,
    page: hasQuery ? page : 1,
    hasMore: hasQuery ? hasMore : false,
    loadMore,
  }
}
