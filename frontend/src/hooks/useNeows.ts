import { useEffect, useRef, useState } from 'react'
import { fetchApi } from '@/lib/api'
import type { NeoFeedResult } from '@/types/neows'

interface UseNeowsResult {
  data: NeoFeedResult | null
  loading: boolean
  error: string | null
}

export function useNeows(startDate: string, endDate: string): UseNeowsResult {
  const [data, setData] = useState<NeoFeedResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fetchedKey, setFetchedKey] = useState<string | null>(null)
  const requestId = useRef(0)

  const requestKey = startDate && endDate ? `${startDate}:${endDate}` : null

  useEffect(() => {
    if (!startDate || !endDate) return

    const controller = new AbortController()
    const id = ++requestId.current

    fetchApi<NeoFeedResult>(
      '/api/neows/feed',
      { start_date: startDate, end_date: endDate },
      controller.signal,
    )
      .then((result) => {
        if (id === requestId.current) {
          setData(result)
          setError(null)
          setFetchedKey(`${startDate}:${endDate}`)
        }
      })
      .catch((err: Error) => {
        if (err.name !== 'AbortError' && id === requestId.current) {
          setError(err.message)
          setFetchedKey(`${startDate}:${endDate}`)
        }
      })

    return () => controller.abort()
  }, [startDate, endDate])

  const loading = requestKey !== null && fetchedKey !== requestKey

  return { data, loading, error }
}
