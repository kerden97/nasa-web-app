import { useEffect, useRef, useState } from 'react'
import { fetchApi } from '@/lib/api'
import {
  createPersistedCacheKey,
  readPersistedCache,
  writePersistedCache,
} from '@/lib/persistedClientCache'
import { neoFeedResultSchema } from '@/schemas/api'
import type { NeoFeedResult } from '@/types/neows'

interface UseNeowsResult {
  data: NeoFeedResult | null
  loading: boolean
  error: string | null
}

interface NeowsState {
  requestKey: string | null
  data: NeoFeedResult | null
  error: string | null
  resolved: boolean
}

function buildRequestKey(startDate: string, endDate: string): string | null {
  return startDate && endDate ? `${startDate}:${endDate}` : null
}

function readCachedNeoFeed(startDate: string, endDate: string): NeoFeedResult | null {
  const requestKey = buildRequestKey(startDate, endDate)
  if (!requestKey) return null

  return readPersistedCache(
    createPersistedCacheKey('neows', 'feed', startDate, endDate),
    neoFeedResultSchema,
  )
}

function createNeowsState(requestKey: string | null, cachedData: NeoFeedResult | null): NeowsState {
  return {
    requestKey,
    data: cachedData,
    error: null,
    resolved: requestKey === null || cachedData !== null,
  }
}

export function useNeows(startDate: string, endDate: string): UseNeowsResult {
  const requestKey = buildRequestKey(startDate, endDate)
  const cachedData = readCachedNeoFeed(startDate, endDate)
  const [state, setState] = useState<NeowsState>(() => createNeowsState(requestKey, cachedData))
  const requestId = useRef(0)

  const activeState =
    state.requestKey === requestKey ? state : createNeowsState(requestKey, cachedData)

  useEffect(() => {
    if (!requestKey) return

    const controller = new AbortController()
    const id = ++requestId.current
    const cacheKey = createPersistedCacheKey('neows', 'feed', startDate, endDate)
    const fallbackData = readCachedNeoFeed(startDate, endDate)
    const hadCachedData = fallbackData !== null

    fetchApi(
      '/api/neows/feed',
      { start_date: startDate, end_date: endDate },
      controller.signal,
      neoFeedResultSchema,
    )
      .then((result) => {
        if (id === requestId.current) {
          setState({
            requestKey,
            data: result,
            error: null,
            resolved: true,
          })
          writePersistedCache(cacheKey, result)
        }
      })
      .catch((err: Error) => {
        if (err.name !== 'AbortError' && id === requestId.current) {
          setState({
            requestKey,
            data: fallbackData,
            error: hadCachedData ? null : err.message,
            resolved: true,
          })
        }
      })

    return () => controller.abort()
  }, [endDate, requestKey, startDate])

  const loading = requestKey !== null && !activeState.resolved

  return {
    data: activeState.data,
    loading,
    error: activeState.error,
  }
}
