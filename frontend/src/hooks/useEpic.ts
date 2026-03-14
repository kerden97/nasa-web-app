import { useEffect, useState } from 'react'
import { fetchApi } from '@/lib/api'
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

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true)
    setError(null)

    const params: Record<string, string> = { collection, date }

    fetchApi<EpicImage[]>('/api/epic', params, controller.signal)
      .then(setImages)
      .catch((err: Error) => {
        if (err.name !== 'AbortError') setError(err.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDates([])
    setLoading(true)

    fetchApi<string[]>('/api/epic/dates', { collection }, controller.signal)
      .then(setDates)
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => controller.abort()
  }, [collection])

  return { dates, loading }
}
