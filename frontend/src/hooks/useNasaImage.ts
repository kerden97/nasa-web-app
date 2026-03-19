import { useCallback, useEffect, useState } from 'react'
import { fetchApi } from '@/lib/api'
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

export function useNasaImage(options: UseNasaImageOptions): UseNasaImageResult {
  const [items, setItems] = useState<NasaImageItem[]>([])
  const [totalHits, setTotalHits] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  const hasQuery = options.query.trim().length > 0

  useEffect(() => {
    if (!hasQuery) return

    const controller = new AbortController()

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems([])
    setPage(1)
    setHasMore(false)
    setLoading(true)
    setError(null)

    const params: Record<string, string> = { q: options.query.trim(), page: '1' }
    if (options.mediaType) params.media_type = options.mediaType
    if (options.yearStart) params.year_start = options.yearStart
    if (options.yearEnd) params.year_end = options.yearEnd

    fetchApi('/api/nasa-image', params, controller.signal, nasaImageSearchResultSchema)
      .then((data) => {
        setItems(data.items)
        setTotalHits(data.totalHits)
        setHasMore(data.items.length > 0 && data.items.length < data.totalHits)
      })
      .catch((err: Error) => {
        if (err.name !== 'AbortError') setError(err.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [options.query, options.mediaType, options.yearStart, options.yearEnd, hasQuery])

  const loadMore = useCallback(() => {
    if (loading || !hasMore || !hasQuery) return

    const nextPage = page + 1
    setLoading(true)

    const params: Record<string, string> = {
      q: options.query.trim(),
      page: String(nextPage),
    }
    if (options.mediaType) params.media_type = options.mediaType
    if (options.yearStart) params.year_start = options.yearStart
    if (options.yearEnd) params.year_end = options.yearEnd

    fetchApi('/api/nasa-image', params, undefined, nasaImageSearchResultSchema)
      .then((data) => {
        setItems((prev) => {
          const updated = [...prev, ...data.items]
          setHasMore(data.items.length > 0 && updated.length < data.totalHits)
          return updated
        })
        setPage(nextPage)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [
    loading,
    hasMore,
    hasQuery,
    page,
    options.query,
    options.mediaType,
    options.yearStart,
    options.yearEnd,
  ])

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
