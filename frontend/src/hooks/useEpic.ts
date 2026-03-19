import { useEffect, useReducer } from 'react'
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

interface UseEpicDatesResult {
  dates: string[]
  loading: boolean
  error: string | null
}

interface EpicState {
  images: EpicImage[]
  loading: boolean
  error: string | null
}

type EpicAction =
  | { type: 'hydrate-cache'; payload: EpicImage[] }
  | { type: 'start-request' }
  | { type: 'resolve-request'; payload: EpicImage[] }
  | { type: 'request-error'; payload: string }

interface EpicDatesState {
  dates: string[]
  loading: boolean
  error: string | null
}

type EpicDatesAction =
  | { type: 'hydrate-cache'; payload: string[] }
  | { type: 'start-request' }
  | { type: 'resolve-request'; payload: string[] }
  | { type: 'request-error'; payload: string }

const initialEpicState: EpicState = {
  images: [],
  loading: false,
  error: null,
}

const initialEpicDatesState: EpicDatesState = {
  dates: [],
  loading: true,
  error: null,
}

function epicReducer(state: EpicState, action: EpicAction): EpicState {
  switch (action.type) {
    case 'hydrate-cache':
      return {
        images: action.payload,
        loading: false,
        error: null,
      }
    case 'start-request':
      return {
        images: [],
        loading: true,
        error: null,
      }
    case 'resolve-request':
      return {
        images: action.payload,
        loading: false,
        error: null,
      }
    case 'request-error':
      return {
        ...state,
        loading: false,
        error: action.payload,
      }
    default:
      return state
  }
}

function epicDatesReducer(state: EpicDatesState, action: EpicDatesAction): EpicDatesState {
  switch (action.type) {
    case 'hydrate-cache':
      return {
        dates: action.payload,
        loading: false,
        error: null,
      }
    case 'start-request':
      return {
        dates: [],
        loading: true,
        error: null,
      }
    case 'resolve-request':
      return {
        dates: action.payload,
        loading: false,
        error: null,
      }
    case 'request-error':
      return {
        ...state,
        loading: false,
        error: action.payload,
      }
    default:
      return state
  }
}

export function useEpic(collection: EpicCollection, date?: string): UseEpicResult {
  const [state, dispatch] = useReducer(epicReducer, initialEpicState)
  const hasDate = Boolean(date)

  useEffect(() => {
    if (!date) return

    const controller = new AbortController()
    const cacheKey = createPersistedCacheKey('epic', 'images', collection, date)
    const cachedImages = readPersistedCache(cacheKey, epicImagesSchema)
    const usedCachedData = Boolean(cachedImages?.length)

    if (usedCachedData) {
      dispatch({ type: 'hydrate-cache', payload: cachedImages! })
    } else {
      dispatch({ type: 'start-request' })
    }

    const params: Record<string, string> = { collection, date }

    fetchApi('/api/epic', params, controller.signal, epicImagesSchema)
      .then((result) => {
        dispatch({ type: 'resolve-request', payload: result })
        writePersistedCache(cacheKey, result)
      })
      .catch((err: Error) => {
        if (err.name !== 'AbortError' && !usedCachedData) {
          dispatch({ type: 'request-error', payload: err.message })
        }
      })

    return () => controller.abort()
  }, [collection, date])

  return {
    images: hasDate ? state.images : [],
    loading: hasDate ? state.loading : false,
    error: hasDate ? state.error : null,
  }
}

export function useEpicDates(collection: EpicCollection): UseEpicDatesResult {
  const [state, dispatch] = useReducer(epicDatesReducer, initialEpicDatesState)

  useEffect(() => {
    const controller = new AbortController()
    const cacheKey = createPersistedCacheKey('epic', 'dates', collection)
    const cachedDates = readPersistedCache(cacheKey, epicDatesSchema)
    const usedCachedData = Boolean(cachedDates?.length)

    if (usedCachedData) {
      dispatch({ type: 'hydrate-cache', payload: cachedDates! })
    } else {
      dispatch({ type: 'start-request' })
    }

    fetchApi('/api/epic/dates', { collection }, controller.signal, epicDatesSchema)
      .then((result) => {
        dispatch({ type: 'resolve-request', payload: result })
        writePersistedCache(cacheKey, result)
      })
      .catch((err: Error) => {
        if (err.name !== 'AbortError' && !usedCachedData) {
          dispatch({ type: 'request-error', payload: err.message })
        }
      })

    return () => controller.abort()
  }, [collection])

  return {
    dates: state.dates,
    loading: state.loading,
    error: state.error,
  }
}
