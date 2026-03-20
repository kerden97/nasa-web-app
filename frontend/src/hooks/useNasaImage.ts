import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { fetchApi } from '@/lib/api'
import {
  createPersistedCacheKey,
  readPersistedCache,
  writePersistedCache,
} from '@/lib/persistedClientCache'
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

interface NasaImageSearchResult {
  items: NasaImageItem[]
  totalHits: number
}

interface NasaImageState {
  searchKey: string | null
  items: NasaImageItem[]
  totalHits: number
  loading: boolean
  error: string | null
  page: number
  hasMore: boolean
}

function buildSearchCacheKey(
  query: string,
  mediaType: string | undefined,
  yearStart: string | undefined,
  yearEnd: string | undefined,
  page: number,
): string {
  return createPersistedCacheKey(
    'nasa-image',
    query,
    mediaType ?? '',
    yearStart ?? '',
    yearEnd ?? '',
    String(page),
  )
}

function buildSearchKey(
  query: string,
  mediaType: string | undefined,
  yearStart: string | undefined,
  yearEnd: string | undefined,
): string {
  return `${query}|${mediaType ?? ''}|${yearStart ?? ''}|${yearEnd ?? ''}`
}

function readCachedSearchResult(
  query: string,
  mediaType: string | undefined,
  yearStart: string | undefined,
  yearEnd: string | undefined,
  page: number,
): NasaImageSearchResult | null {
  return readPersistedCache(
    buildSearchCacheKey(query, mediaType, yearStart, yearEnd, page),
    nasaImageSearchResultSchema,
  )
}

function createSearchState(
  searchKey: string | null,
  cachedResult: NasaImageSearchResult | null,
): NasaImageState {
  if (!searchKey) {
    return {
      searchKey: null,
      items: [],
      totalHits: 0,
      loading: false,
      error: null,
      page: 1,
      hasMore: false,
    }
  }

  if (!cachedResult) {
    return {
      searchKey,
      items: [],
      totalHits: 0,
      loading: true,
      error: null,
      page: 1,
      hasMore: false,
    }
  }

  return {
    searchKey,
    items: cachedResult.items,
    totalHits: cachedResult.totalHits,
    loading: false,
    error: null,
    page: 1,
    hasMore: cachedResult.items.length > 0 && cachedResult.items.length < cachedResult.totalHits,
  }
}

function getActiveSearchState(
  state: NasaImageState,
  searchKey: string | null,
  cachedResult: NasaImageSearchResult | null,
): NasaImageState {
  return state.searchKey === searchKey ? state : createSearchState(searchKey, cachedResult)
}

export function useNasaImage(options: UseNasaImageOptions): UseNasaImageResult {
  const trimmedQuery = options.query.trim()
  const { mediaType, yearStart, yearEnd } = options
  const hasQuery = trimmedQuery.length > 0
  const searchKey = hasQuery ? buildSearchKey(trimmedQuery, mediaType, yearStart, yearEnd) : null
  const cachedFirstPage = hasQuery
    ? readCachedSearchResult(trimmedQuery, mediaType, yearStart, yearEnd, 1)
    : null

  const [state, setState] = useState<NasaImageState>(() =>
    createSearchState(searchKey, cachedFirstPage),
  )
  const activeSearchKeyRef = useRef(searchKey)
  const requestIdRef = useRef(0)
  const loadMoreControllerRef = useRef<AbortController | null>(null)

  const activeState = getActiveSearchState(state, searchKey, cachedFirstPage)

  useLayoutEffect(() => {
    activeSearchKeyRef.current = searchKey
    loadMoreControllerRef.current?.abort()
    loadMoreControllerRef.current = null
  }, [searchKey])

  useEffect(() => {
    if (!hasQuery || !searchKey) return

    const controller = new AbortController()
    const cacheKey = buildSearchCacheKey(trimmedQuery, mediaType, yearStart, yearEnd, 1)
    const requestId = ++requestIdRef.current
    const requestSearchKey = searchKey

    const params: Record<string, string> = { q: trimmedQuery, page: '1' }
    if (mediaType) params.media_type = mediaType
    if (yearStart) params.year_start = yearStart
    if (yearEnd) params.year_end = yearEnd

    fetchApi('/api/nasa-image', params, controller.signal, nasaImageSearchResultSchema)
      .then((data) => {
        if (
          controller.signal.aborted ||
          requestId !== requestIdRef.current ||
          activeSearchKeyRef.current !== requestSearchKey
        ) {
          return
        }

        setState({
          searchKey: requestSearchKey,
          items: data.items,
          totalHits: data.totalHits,
          loading: false,
          error: null,
          page: 1,
          hasMore: data.items.length > 0 && data.items.length < data.totalHits,
        })
        writePersistedCache<NasaImageSearchResult>(cacheKey, data)
      })
      .catch((err: Error) => {
        if (
          err.name !== 'AbortError' &&
          requestId === requestIdRef.current &&
          activeSearchKeyRef.current === requestSearchKey
        ) {
          const fallbackState = createSearchState(
            requestSearchKey,
            readCachedSearchResult(trimmedQuery, mediaType, yearStart, yearEnd, 1),
          )

          setState({
            ...fallbackState,
            error: err.message,
            loading: false,
          })
        }
      })

    return () => controller.abort()
  }, [trimmedQuery, mediaType, yearStart, yearEnd, hasQuery, searchKey])

  const loadMore = useCallback(() => {
    if (activeState.loading || !activeState.hasMore || !hasQuery || !searchKey) return

    const nextPage = activeState.page + 1
    const cacheKey = buildSearchCacheKey(trimmedQuery, mediaType, yearStart, yearEnd, nextPage)
    const cachedResult = readCachedSearchResult(
      trimmedQuery,
      mediaType,
      yearStart,
      yearEnd,
      nextPage,
    )

    if (cachedResult) {
      setState((prev) => {
        const baseState = getActiveSearchState(
          prev,
          searchKey,
          readCachedSearchResult(trimmedQuery, mediaType, yearStart, yearEnd, 1),
        )
        const updatedItems = [...baseState.items, ...cachedResult.items]

        return {
          ...baseState,
          searchKey,
          items: updatedItems,
          totalHits: cachedResult.totalHits,
          page: nextPage,
          hasMore: cachedResult.items.length > 0 && updatedItems.length < cachedResult.totalHits,
        }
      })
      return
    }

    setState((prev) => ({
      ...getActiveSearchState(
        prev,
        searchKey,
        readCachedSearchResult(trimmedQuery, mediaType, yearStart, yearEnd, 1),
      ),
      searchKey,
      loading: true,
      error: null,
    }))

    const requestSearchKey = searchKey
    const controller = new AbortController()

    loadMoreControllerRef.current?.abort()
    loadMoreControllerRef.current = controller

    const params: Record<string, string> = {
      q: trimmedQuery,
      page: String(nextPage),
    }
    if (mediaType) params.media_type = mediaType
    if (yearStart) params.year_start = yearStart
    if (yearEnd) params.year_end = yearEnd

    fetchApi('/api/nasa-image', params, controller.signal, nasaImageSearchResultSchema)
      .then((data) => {
        if (
          controller.signal.aborted ||
          activeSearchKeyRef.current !== requestSearchKey ||
          loadMoreControllerRef.current !== controller
        ) {
          return
        }

        loadMoreControllerRef.current = null
        writePersistedCache<NasaImageSearchResult>(cacheKey, data)
        setState((prev) => {
          const baseState = getActiveSearchState(
            prev,
            requestSearchKey,
            readCachedSearchResult(trimmedQuery, mediaType, yearStart, yearEnd, 1),
          )
          const updatedItems = [...baseState.items, ...data.items]

          return {
            ...baseState,
            searchKey: requestSearchKey,
            items: updatedItems,
            totalHits: data.totalHits,
            loading: false,
            error: null,
            page: nextPage,
            hasMore: data.items.length > 0 && updatedItems.length < data.totalHits,
          }
        })
      })
      .catch((err: Error) => {
        if (
          err.name !== 'AbortError' &&
          activeSearchKeyRef.current === requestSearchKey &&
          loadMoreControllerRef.current === controller
        ) {
          loadMoreControllerRef.current = null
          setState((prev) => ({
            ...getActiveSearchState(
              prev,
              requestSearchKey,
              readCachedSearchResult(trimmedQuery, mediaType, yearStart, yearEnd, 1),
            ),
            searchKey: requestSearchKey,
            loading: false,
            error: err.message,
          }))
        }
      })
  }, [
    activeState.hasMore,
    activeState.loading,
    activeState.page,
    hasQuery,
    mediaType,
    searchKey,
    trimmedQuery,
    yearStart,
    yearEnd,
  ])

  return {
    items: hasQuery ? activeState.items : [],
    totalHits: hasQuery ? activeState.totalHits : 0,
    loading: hasQuery ? activeState.loading : false,
    error: hasQuery ? activeState.error : null,
    page: hasQuery ? activeState.page : 1,
    hasMore: hasQuery ? activeState.hasMore : false,
    loadMore,
  }
}
