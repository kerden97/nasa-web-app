import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchApi } from '@/lib/api'
import { APOD_EPOCH } from '@/lib/apodMeta'
import {
  createPersistedCacheKey,
  readPersistedCache,
  writePersistedCache,
} from '@/lib/persistedClientCache'
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
const APOD_LATEST_CACHE_KEY = createPersistedCacheKey('apod', 'latest-list')

interface ApodLatestCache {
  items: ApodItem[]
  oldestDate: string | null
  hasMore: boolean
}

interface CoveredRange {
  start: string
  end: string
}

function subtractDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString().split('T')[0]!
}

function collectItemsFromRange(
  pool: Map<string, ApodItem>,
  start: string,
  end: string,
): ApodItem[] {
  return Array.from(pool.values())
    .filter((item) => item.date >= start && item.date <= end)
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function useApod(options: UseApodOptions = {}): UseApodResult {
  const [items, setItems] = useState<ApodItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [oldestDate, setOldestDate] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)

  // Responsive pageSize for load-more only — updated on resize via ref
  const pageSizeRef = useRef(options.pageSize ?? 20)
  const requestInFlightRef = useRef(false)
  const itemPoolRef = useRef<Map<string, ApodItem>>(new Map())
  const coveredRangesRef = useRef<CoveredRange[]>([])
  useEffect(() => {
    pageSizeRef.current = options.pageSize ?? 20
  }, [options.pageSize])

  const isCustomRange = !!(options.date || options.startDate)
  const isLatestFeed = !isCustomRange

  const addItemsToPool = useCallback((list: ApodItem[]) => {
    list.forEach((item) => {
      itemPoolRef.current.set(item.date, item)
    })
  }, [])

  const addCoveredRange = useCallback((start: string, end: string) => {
    coveredRangesRef.current.push({ start, end })
  }, [])

  const hasCoveredRange = useCallback((start: string, end: string) => {
    return coveredRangesRef.current.some((range) => range.start <= start && range.end >= end)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    let usedCachedData = false

    requestInFlightRef.current = true
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null)

    const params: Record<string, string> = {}

    if (options.date) {
      params.date = options.date
    } else if (options.startDate) {
      params.start_date = options.startDate
      if (options.endDate) params.end_date = options.endDate
    } else {
      params.count = String(FIRST_PAGE_SIZE)

      const cached = readPersistedCache<ApodLatestCache>(APOD_LATEST_CACHE_KEY)
      if (cached?.items.length) {
        usedCachedData = true
        addItemsToPool(cached.items)
        addCoveredRange(
          cached.oldestDate ?? cached.items[cached.items.length - 1]!.date,
          cached.items[0]!.date,
        )
        setItems(cached.items)
        setOldestDate(cached.oldestDate ?? cached.items[cached.items.length - 1]!.date)
        setHasMore(cached.hasMore)
        setLoading(false)
      }
    }

    if (options.date) {
      const exactItem = itemPoolRef.current.get(options.date)
      if (exactItem) {
        requestInFlightRef.current = false
        setItems([exactItem])
        setOldestDate(exactItem.date)
        setHasMore(false)
        setLoading(false)
        return () => controller.abort()
      }
    } else if (options.startDate) {
      const rangeEnd = options.endDate ?? options.startDate
      if (hasCoveredRange(options.startDate, rangeEnd)) {
        const localItems = collectItemsFromRange(itemPoolRef.current, options.startDate, rangeEnd)
        requestInFlightRef.current = false
        setItems(localItems)
        setOldestDate(localItems[localItems.length - 1]?.date ?? null)
        setHasMore(false)
        setLoading(false)
        return () => controller.abort()
      }
    }

    if (!usedCachedData) {
      // Reset state when filter dependencies change — intentional synchronous batch
      setItems([])
      setOldestDate(null)
      setHasMore(true)
      setLoading(true)
    }

    fetchApi<ApodItem | ApodItem[]>(
      '/api/apod',
      Object.keys(params).length ? params : undefined,
      controller.signal,
    )
      .then((data) => {
        const list = Array.isArray(data) ? data : [data]
        const nextOldestDate = list.length > 0 ? list[list.length - 1]!.date : null
        const nextHasMore =
          !(options.date || options.startDate) &&
          list.length >= FIRST_PAGE_SIZE &&
          nextOldestDate !== null &&
          nextOldestDate > APOD_EPOCH

        addItemsToPool(list)
        setItems(list)
        setOldestDate(nextOldestDate)
        if (options.date || options.startDate) {
          if (options.date) {
            addCoveredRange(options.date, options.date)
          } else {
            addCoveredRange(options.startDate!, options.endDate ?? options.startDate!)
          }
          setHasMore(false)
          return
        }

        if (nextOldestDate && list[0]) {
          addCoveredRange(nextOldestDate, list[0].date)
        }
        setHasMore(nextHasMore)
        if (isLatestFeed) {
          writePersistedCache<ApodLatestCache>(APOD_LATEST_CACHE_KEY, {
            items: list,
            oldestDate: nextOldestDate,
            hasMore: nextHasMore,
          })
        }
      })
      .catch((err: Error) => {
        if (err.name !== 'AbortError' && !usedCachedData) setError(err.message)
      })
      .finally(() => {
        requestInFlightRef.current = false
        if (!controller.signal.aborted && !usedCachedData) setLoading(false)
      })

    return () => {
      controller.abort()
      requestInFlightRef.current = false
    }
  }, [
    addCoveredRange,
    addItemsToPool,
    hasCoveredRange,
    isLatestFeed,
    options.date,
    options.startDate,
    options.endDate,
  ])

  const loadMore = useCallback(() => {
    if (loading || requestInFlightRef.current || !hasMore || !oldestDate || isCustomRange) return

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
        addItemsToPool(data)
        setItems((prev) => [...prev, ...data])
        if (data.length > 0) {
          setOldestDate(data[data.length - 1]!.date)
          addCoveredRange(data[data.length - 1]!.date, endDate)
        }
        setHasMore(data.length >= size && data[data.length - 1]!.date > APOD_EPOCH)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [addCoveredRange, addItemsToPool, loading, hasMore, oldestDate, isCustomRange])

  return { items, loading, error, loadMore, hasMore }
}
