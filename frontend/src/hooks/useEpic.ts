import { useEffect, useState } from 'react'
import { fetchApi } from '@/lib/api'
import {
  createPersistedCacheKey,
  readPersistedCache,
  writePersistedCache,
} from '@/lib/persistedClientCache'
import { epicDatesSchema, epicImagesSchema } from '@/schemas/api'
import type { EpicImage, EpicCollection } from '@/types/epic'

interface UseEpicResult {
  images: EpicImage[]
  loading: boolean
  error: string | null
}

export function useEpic(collection: EpicCollection, date?: string): UseEpicResult {
  const [images, setImages] = useState<EpicImage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasDate = Boolean(date)

  useEffect(() => {
    if (!date) return

    const controller = new AbortController()
    const cacheKey = createPersistedCacheKey('epic', 'images', collection, date)
    const cachedImages = readPersistedCache(cacheKey, epicImagesSchema)
    const usedCachedData = Boolean(cachedImages?.length)

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError(null)
    if (usedCachedData) {
      setImages(cachedImages!)
      setLoading(false)
    } else {
      setImages([])
      setLoading(true)
    }

    const params: Record<string, string> = { collection, date }

    fetchApi('/api/epic', params, controller.signal, epicImagesSchema)
      .then((result) => {
        setImages(result)
        writePersistedCache(cacheKey, result)
      })
      .catch((err: Error) => {
        if (err.name !== 'AbortError' && !usedCachedData) setError(err.message)
      })
      .finally(() => {
        if (!controller.signal.aborted && !usedCachedData) setLoading(false)
      })

    return () => controller.abort()
  }, [collection, date])

  return {
    images: hasDate ? images : [],
    loading: hasDate ? loading : false,
    error: hasDate ? error : null,
  }
}

export function useEpicDates(collection: EpicCollection) {
  const [dates, setDates] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    const cacheKey = createPersistedCacheKey('epic', 'dates', collection)
    const cachedDates = readPersistedCache(cacheKey, epicDatesSchema)
    const usedCachedData = Boolean(cachedDates?.length)

    if (usedCachedData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDates(cachedDates!)
      setLoading(false)
    } else {
      setDates([])
      setLoading(true)
    }

    fetchApi('/api/epic/dates', { collection }, controller.signal, epicDatesSchema)
      .then((result) => {
        setDates(result)
        writePersistedCache(cacheKey, result)
      })
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted && !usedCachedData) setLoading(false)
      })

    return () => controller.abort()
  }, [collection])

  return { dates, loading }
}
