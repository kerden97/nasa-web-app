import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchApi } from '@/lib/api'
import { APOD_EPOCH } from '@/lib/apodMeta'
import type { ApodItem } from '@/types/apod'

interface UseApodOptions {
  date?: string
  startDate?: string
  endDate?: string
  pageSize?: number
}

interface UseApodResult {
  items: ApodItem[]
  loading: boolean
  error: string | null
  loadMore: () => void
  hasMore: boolean
}

// Always fetch 21 on first load — covers all breakpoints without client detection delay
const FIRST_PAGE_SIZE = 21

function subtractDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString().split('T')[0]!
}

export function useApod(options: UseApodOptions = {}): UseApodResult {
  const [items, setItems] = useState<ApodItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [oldestDate, setOldestDate] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)

  // Responsive pageSize for load-more only — updated on resize via ref
  const pageSizeRef = useRef(options.pageSize ?? 20)
  useEffect(() => {
    pageSizeRef.current = options.pageSize ?? 20
  }, [options.pageSize])

  const isCustomRange = !!(options.date || options.startDate)

  useEffect(() => {
    const controller = new AbortController()

    // Reset state when filter dependencies change — intentional synchronous batch
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setItems([])
    setOldestDate(null)
    setHasMore(true)
    setLoading(true)
    setError(null)

    const params: Record<string, string> = {}

    if (options.date) {
      params.date = options.date
    } else if (options.startDate) {
      params.start_date = options.startDate
      if (options.endDate) params.end_date = options.endDate
    } else {
      params.count = String(FIRST_PAGE_SIZE)
    }

    fetchApi<ApodItem | ApodItem[]>(
      '/api/apod',
      Object.keys(params).length ? params : undefined,
      controller.signal,
    )
      .then((data) => {
        const list = Array.isArray(data) ? data : [data]
        setItems(list)
        if (list.length > 0) {
          setOldestDate(list[list.length - 1]!.date)
        }
        if (options.date || options.startDate) {
          setHasMore(false)
          return
        }

        setHasMore(list.length >= FIRST_PAGE_SIZE && list[list.length - 1]!.date > APOD_EPOCH)
      })
      .catch((err: Error) => {
        if (err.name !== 'AbortError') setError(err.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [options.date, options.startDate, options.endDate])

  const loadMore = useCallback(() => {
    if (loading || !hasMore || !oldestDate || isCustomRange) return

    const size = pageSizeRef.current
    setLoading(true)
    const endDate = subtractDays(oldestDate, 1)

    if (endDate < APOD_EPOCH) {
      setHasMore(false)
      setLoading(false)
      return
    }

    fetchApi<ApodItem[]>('/api/apod', {
      end_date: endDate,
      count: String(size),
    })
      .then((data) => {
        setItems((prev) => [...prev, ...data])
        if (data.length > 0) {
          setOldestDate(data[data.length - 1]!.date)
        }
        setHasMore(data.length >= size && data[data.length - 1]!.date > APOD_EPOCH)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [loading, hasMore, oldestDate, isCustomRange])

  return { items, loading, error, loadMore, hasMore }
}
