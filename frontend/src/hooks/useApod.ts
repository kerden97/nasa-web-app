import { useCallback, useEffect, useReducer, useRef } from 'react'
import { fetchApi } from '@/lib/api'
import { APOD_EPOCH } from '@/lib/apodMeta'
import { consumeApodPrefetch } from '@/lib/apodPrefetch'
import {
  createPersistedCacheKey,
  readPersistedCache,
  writePersistedCache,
} from '@/lib/persistedClientCache'
import { apodItemsSchema, apodLatestCacheSchema, apodResponseSchema } from '@/schemas/api'
import type { ApodLatestCache } from '@/schemas/api'
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

interface CoveredRange {
  start: string
  end: string
}

interface ApodState {
  items: ApodItem[]
  loading: boolean
  error: string | null
  oldestDate: string | null
  hasMore: boolean
}

type ApodAction =
  | { type: 'start-request' }
  | {
      type: 'hydrate-cache'
      payload: Pick<ApodState, 'items' | 'oldestDate' | 'hasMore'>
    }
  | {
      type: 'use-local-items'
      payload: Pick<ApodState, 'items' | 'oldestDate'>
    }
  | {
      type: 'resolve-request'
      payload: Pick<ApodState, 'items' | 'oldestDate' | 'hasMore'>
    }
  | { type: 'request-error'; payload: string }
  | { type: 'load-more-start' }
  | {
      type: 'load-more-success'
      payload: {
        items: ApodItem[]
        oldestDate: string | null
        hasMore: boolean
      }
    }
  | { type: 'load-more-error'; payload: string }

const initialState: ApodState = {
  items: [],
  loading: true,
  error: null,
  oldestDate: null,
  hasMore: true,
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

function apodReducer(state: ApodState, action: ApodAction): ApodState {
  switch (action.type) {
    case 'start-request':
      return {
        ...initialState,
        loading: true,
      }
    case 'hydrate-cache':
      return {
        ...state,
        error: null,
        items: action.payload.items,
        oldestDate: action.payload.oldestDate,
        hasMore: action.payload.hasMore,
        loading: false,
      }
    case 'use-local-items':
      return {
        ...state,
        error: null,
        items: action.payload.items,
        oldestDate: action.payload.oldestDate,
        hasMore: false,
        loading: false,
      }
    case 'resolve-request':
      return {
        ...state,
        error: null,
        items: action.payload.items,
        oldestDate: action.payload.oldestDate,
        hasMore: action.payload.hasMore,
        loading: false,
      }
    case 'request-error':
      return {
        ...state,
        error: action.payload,
        loading: false,
      }
    case 'load-more-start':
      return {
        ...state,
        error: null,
        loading: true,
      }
    case 'load-more-success':
      return {
        ...state,
        error: null,
        items: [...state.items, ...action.payload.items],
        oldestDate: action.payload.oldestDate,
        hasMore: action.payload.hasMore,
        loading: false,
      }
    case 'load-more-error':
      return {
        ...state,
        error: action.payload,
        loading: false,
      }
    default:
      return state
  }
}

function addItemsToPool(pool: Map<string, ApodItem>, list: ApodItem[]) {
  list.forEach((item) => {
    pool.set(item.date, item)
  })
}

function addCoveredRange(rangesRef: { current: CoveredRange[] }, start: string, end: string) {
  rangesRef.current.push({ start, end })
}

function hasCoveredRange(ranges: CoveredRange[], start: string, end: string) {
  return ranges.some((range) => range.start <= start && range.end >= end)
}

function getRequestParams(options: UseApodOptions): Record<string, string> {
  if (options.date) return { date: options.date }

  if (options.startDate) {
    return {
      start_date: options.startDate,
      ...(options.endDate ? { end_date: options.endDate } : {}),
    }
  }

  return { count: String(FIRST_PAGE_SIZE) }
}

function getCachedLatestState(
  cached: ApodLatestCache,
): Pick<ApodState, 'items' | 'oldestDate' | 'hasMore'> {
  return {
    items: cached.items,
    oldestDate: cached.oldestDate ?? cached.items[cached.items.length - 1]?.date ?? null,
    hasMore: cached.hasMore,
  }
}

function getResolvedState(
  list: ApodItem[],
  isLatestFeed: boolean,
): Pick<ApodState, 'items' | 'oldestDate' | 'hasMore'> {
  const oldestDate = list[list.length - 1]?.date ?? null
  const hasMore =
    isLatestFeed && list.length >= FIRST_PAGE_SIZE && oldestDate !== null && oldestDate > APOD_EPOCH

  return {
    items: list,
    oldestDate,
    hasMore,
  }
}

function getLocalItems(
  options: UseApodOptions,
  pool: Map<string, ApodItem>,
  coveredRanges: CoveredRange[],
): ApodItem[] | null {
  if (options.date) {
    const exactItem = pool.get(options.date)
    return exactItem ? [exactItem] : null
  }

  if (!options.startDate) return null

  const rangeEnd = options.endDate ?? options.startDate
  if (!hasCoveredRange(coveredRanges, options.startDate, rangeEnd)) {
    return null
  }

  return collectItemsFromRange(pool, options.startDate, rangeEnd)
}

export function useApod(options: UseApodOptions = {}): UseApodResult {
  const [state, dispatch] = useReducer(apodReducer, initialState)
  const { date, startDate, endDate } = options

  // Responsive pageSize for load-more only — updated on resize via ref
  const pageSizeRef = useRef(options.pageSize ?? 20)
  const requestInFlightRef = useRef(false)
  const itemPoolRef = useRef<Map<string, ApodItem>>(new Map())
  const coveredRangesRef = useRef<CoveredRange[]>([])

  useEffect(() => {
    pageSizeRef.current = options.pageSize ?? 20
  }, [options.pageSize])

  const isCustomRange = !!(date || startDate)
  const isLatestFeed = !isCustomRange

  useEffect(() => {
    const controller = new AbortController()
    const params = getRequestParams({ date, startDate, endDate })
    let usedCachedData = false

    requestInFlightRef.current = true

    if (isLatestFeed) {
      const cached = readPersistedCache(APOD_LATEST_CACHE_KEY, apodLatestCacheSchema)
      if (cached?.items.length) {
        usedCachedData = true
        addItemsToPool(itemPoolRef.current, cached.items)
        addCoveredRange(
          coveredRangesRef,
          cached.oldestDate ?? cached.items[cached.items.length - 1]!.date,
          cached.items[0]!.date,
        )
        dispatch({
          type: 'hydrate-cache',
          payload: getCachedLatestState(cached),
        })
      }
    }

    const localItems = getLocalItems(
      { date, startDate, endDate },
      itemPoolRef.current,
      coveredRangesRef.current,
    )
    if (localItems) {
      requestInFlightRef.current = false
      dispatch({
        type: 'use-local-items',
        payload: {
          items: localItems,
          oldestDate: localItems[localItems.length - 1]?.date ?? null,
        },
      })
      return () => controller.abort()
    }

    if (!usedCachedData) {
      dispatch({ type: 'start-request' })
    }

    const dataPromise =
      isLatestFeed && !Object.keys(params).length
        ? (consumeApodPrefetch() ??
          fetchApi(
            '/api/apod',
            { count: String(FIRST_PAGE_SIZE) },
            controller.signal,
            apodResponseSchema,
          ).then((data) => (Array.isArray(data) ? data : [data])))
        : fetchApi(
            '/api/apod',
            Object.keys(params).length ? params : undefined,
            controller.signal,
            apodResponseSchema,
          ).then((data) => (Array.isArray(data) ? data : [data]))

    dataPromise
      .then((list) => {
        addItemsToPool(itemPoolRef.current, list)

        if (date || startDate) {
          if (date) {
            addCoveredRange(coveredRangesRef, date, date)
          } else {
            addCoveredRange(coveredRangesRef, startDate!, endDate ?? startDate!)
          }
        } else {
          const oldestDate = list[list.length - 1]?.date
          if (oldestDate && list[0]) {
            addCoveredRange(coveredRangesRef, oldestDate, list[0].date)
          }
        }

        const nextState = getResolvedState(list, isLatestFeed)
        dispatch({
          type: 'resolve-request',
          payload: nextState,
        })

        if (isLatestFeed) {
          writePersistedCache<ApodLatestCache>(APOD_LATEST_CACHE_KEY, {
            items: list,
            oldestDate: nextState.oldestDate,
            hasMore: nextState.hasMore,
          })
        }
      })
      .catch((err: Error) => {
        if (err.name !== 'AbortError' && !usedCachedData) {
          dispatch({ type: 'request-error', payload: err.message })
        }
      })
      .finally(() => {
        requestInFlightRef.current = false
      })

    return () => {
      controller.abort()
      requestInFlightRef.current = false
    }
  }, [date, endDate, isLatestFeed, startDate])

  const loadMore = useCallback(() => {
    if (
      state.loading ||
      requestInFlightRef.current ||
      !state.hasMore ||
      !state.oldestDate ||
      isCustomRange
    ) {
      return
    }

    const size = pageSizeRef.current
    const endDate = subtractDays(state.oldestDate, 1)

    if (endDate < APOD_EPOCH) {
      dispatch({
        type: 'resolve-request',
        payload: {
          items: state.items,
          oldestDate: state.oldestDate,
          hasMore: false,
        },
      })
      return
    }

    requestInFlightRef.current = true
    dispatch({ type: 'load-more-start' })

    fetchApi(
      '/api/apod',
      {
        end_date: endDate,
        count: String(size),
      },
      undefined,
      apodItemsSchema,
    )
      .then((data) => {
        addItemsToPool(itemPoolRef.current, data)

        const nextOldestDate = data[data.length - 1]?.date ?? state.oldestDate
        if (nextOldestDate) {
          addCoveredRange(coveredRangesRef, nextOldestDate, endDate)
        }

        dispatch({
          type: 'load-more-success',
          payload: {
            items: data,
            oldestDate: nextOldestDate,
            hasMore: data.length >= size && nextOldestDate > APOD_EPOCH,
          },
        })
      })
      .catch((err: Error) => {
        dispatch({ type: 'load-more-error', payload: err.message })
      })
      .finally(() => {
        requestInFlightRef.current = false
      })
  }, [isCustomRange, state.hasMore, state.items, state.loading, state.oldestDate])

  return {
    items: state.items,
    loading: state.loading,
    error: state.error,
    loadMore,
    hasMore: state.hasMore,
  }
}
