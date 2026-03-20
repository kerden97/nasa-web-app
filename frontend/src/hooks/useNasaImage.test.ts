import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useNasaImage } from '@/hooks/useNasaImage'
import { fetchApi } from '@/lib/api'
import type { NasaImageItem } from '@/types/nasaImage'

vi.mock('@/lib/api', () => ({
  fetchApi: vi.fn(),
}))

interface Deferred<T> {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (reason?: unknown) => void
}

function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void

  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })

  return { promise, resolve, reject }
}

function createNasaImageItems(prefix: string, count: number): NasaImageItem[] {
  return Array.from({ length: count }, (_, index) => ({
    nasa_id: `${prefix}-${index + 1}`,
    title: `${prefix} ${index + 1}`,
    description: `${prefix} description ${index + 1}`,
    date_created: `2026-03-${String(index + 1).padStart(2, '0')}T00:00:00Z`,
    media_type: 'image',
    href: `https://example.com/${prefix.toLowerCase()}-${index + 1}.jpg`,
  }))
}

describe('useNasaImage', () => {
  const mockedFetchApi = vi.mocked(fetchApi)

  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('ignores stale load-more results after the search query changes', async () => {
    const apolloItems = createNasaImageItems('Apollo', 2)
    const apolloPageTwo = createNasaImageItems('Apollo More', 2)
    const marsItems = createNasaImageItems('Mars', 1)
    const loadMoreDeferred = createDeferred<{ items: NasaImageItem[]; totalHits: number }>()

    mockedFetchApi
      .mockResolvedValueOnce({ items: apolloItems, totalHits: 4 })
      .mockImplementationOnce(() => loadMoreDeferred.promise)
      .mockResolvedValueOnce({ items: marsItems, totalHits: 1 })

    const { result, rerender } = renderHook(
      ({ query }: { query: string }) =>
        useNasaImage({
          query,
        }),
      {
        initialProps: { query: 'apollo' },
      },
    )

    await waitFor(() => expect(result.current.items).toEqual(apolloItems))
    expect(result.current.page).toBe(1)
    expect(result.current.hasMore).toBe(true)

    act(() => {
      result.current.loadMore()
    })

    await waitFor(() => expect(mockedFetchApi).toHaveBeenCalledTimes(2))

    rerender({ query: 'mars' })

    await waitFor(() => expect(result.current.items).toEqual(marsItems))
    expect(result.current.page).toBe(1)
    expect(result.current.totalHits).toBe(1)
    expect(result.current.hasMore).toBe(false)

    await act(async () => {
      loadMoreDeferred.resolve({ items: apolloPageTwo, totalHits: 4 })
      await loadMoreDeferred.promise
    })

    expect(result.current.items).toEqual(marsItems)
    expect(result.current.page).toBe(1)
    expect(result.current.totalHits).toBe(1)
    expect(result.current.hasMore).toBe(false)
    expect(result.current.error).toBeNull()
  })
})
