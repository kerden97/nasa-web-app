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

export function useNeows(startDate: string, endDate: string): UseNeowsResult {
  const requestKey = startDate && endDate ? `${startDate}:${endDate}` : null
  const cacheKey = requestKey
    ? createPersistedCacheKey('neows', 'feed', startDate, endDate)
    : null
  const initialCache = cacheKey ? readPersistedCache(cacheKey, neoFeedResultSchema) : null

  const [data, setData] = useState<NeoFeedResult | null>(() => initialCache)
  const [error, setError] = useState<string | null>(null)
  const [fetchedKey, setFetchedKey] = useState<string | null>(() =>
    initialCache ? requestKey : null,
  )
  const requestId = useRef(0)
  const prevKeyRef = useRef(requestKey)

  if (prevKeyRef.current !== requestKey) {
    prevKeyRef.current = requestKey
    const newCache = cacheKey ? readPersistedCache(cacheKey, neoFeedResultSchema) : null
    if (newCache) {
      setData(newCache)
      setError(null)
      setFetchedKey(requestKey)
    } else {
      setData(null)
      setError(null)
      setFetchedKey(null)
    }
  }

  useEffect(() => {
    if (!startDate || !endDate) return

    const controller = new AbortController()
    const id = ++requestId.current
    const key = createPersistedCacheKey('neows', 'feed', startDate, endDate)

    fetchApi(
      '/api/neows/feed',
      { start_date: startDate, end_date: endDate },
      controller.signal,
      neoFeedResultSchema,
    )
      .then((result) => {
        if (id === requestId.current) {
          setData(result)
          setError(null)
          setFetchedKey(`${startDate}:${endDate}`)
          writePersistedCache(key, result)
        }
      })
      .catch((err: Error) => {
        if (err.name !== 'AbortError' && id === requestId.current) {
          setFetchedKey(`${startDate}:${endDate}`)
        }
      })

    return () => controller.abort()
  }, [startDate, endDate])

  const loading = requestKey !== null && fetchedKey !== requestKey

  return { data, loading, error }
}
