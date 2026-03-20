import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useApod } from '@/hooks/useApod'
import { fetchApi } from '@/lib/api'
import { createPersistedCacheKey, writePersistedCache } from '@/lib/persistedClientCache'
import type { ApodItem } from '@/types/apod'

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

function createApodItems(startDate: string, count: number, titlePrefix: string): ApodItem[] {
  const start = new Date(`${startDate}T00:00:00Z`)

  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start)
    date.setUTCDate(start.getUTCDate() - index)

    return {
      date: date.toISOString().split('T')[0]!,
      title: `${titlePrefix} ${index + 1}`,
      explanation: `${titlePrefix} explanation ${index + 1}`,
      url: `https://example.com/${titlePrefix.toLowerCase().replaceAll(' ', '-')}-${index + 1}.jpg`,
      media_type: 'image',
    }
  })
}

describe('useApod', () => {
  const mockedFetchApi = vi.mocked(fetchApi)
  const cachedItems: ApodItem[] = [
    {
      date: '2026-03-18',
      title: 'Cached APOD',
      explanation: 'Cached explanation',
      url: 'https://example.com/apod.jpg',
      media_type: 'image',
    },
  ]

  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('shows cached latest APOD items immediately while revalidating', async () => {
    writePersistedCache(createPersistedCacheKey('apod', 'latest-list'), {
      items: cachedItems,
      oldestDate: '2026-03-18',
      hasMore: true,
    })

    let resolveFetch: ((value: ApodItem[]) => void) | undefined
    mockedFetchApi.mockImplementation(
      () =>
        new Promise<ApodItem[]>((resolve) => {
          resolveFetch = resolve
        }),
    )

    const { result } = renderHook(() => useApod())

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.items).toEqual(cachedItems)

    resolveFetch?.(cachedItems)
    await waitFor(() => expect(mockedFetchApi).toHaveBeenCalledTimes(1))
  })

  it('keeps cached APOD items visible when background revalidation fails', async () => {
    writePersistedCache(createPersistedCacheKey('apod', 'latest-list'), {
      items: cachedItems,
      oldestDate: '2026-03-18',
      hasMore: true,
    })

    mockedFetchApi.mockRejectedValue(new Error('network failure'))

    const { result } = renderHook(() => useApod())

    await waitFor(() => expect(mockedFetchApi).toHaveBeenCalledTimes(1))
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.items).toEqual(cachedItems)
  })

  it('reuses already-loaded APOD items for covered ranges without refetching', async () => {
    const loadedItems = Array.from({ length: 10 }, (_, index) => ({
      date: `2026-03-${String(18 - index).padStart(2, '0')}`,
      title: `APOD ${index}`,
      explanation: `Explanation ${index}`,
      url: `https://example.com/apod-${index}.jpg`,
      media_type: 'image' as const,
    }))

    mockedFetchApi.mockResolvedValueOnce(loadedItems)

    const { result, rerender } = renderHook(
      ({ options }: { options?: Parameters<typeof useApod>[0] }) => useApod(options),
      {
        initialProps: { options: {} },
      },
    )

    await waitFor(() => expect(result.current.items).toEqual(loadedItems))
    expect(mockedFetchApi).toHaveBeenCalledTimes(1)

    rerender({
      options: {
        startDate: '2026-03-15',
        endDate: '2026-03-18',
      },
    })

    await waitFor(() =>
      expect(result.current.items.map((item) => item.date)).toEqual([
        '2026-03-18',
        '2026-03-17',
        '2026-03-16',
        '2026-03-15',
      ]),
    )
    expect(mockedFetchApi).toHaveBeenCalledTimes(1)
  })

  it('ignores stale load-more results after switching to a different APOD view', async () => {
    const latestItems = createApodItems('2026-03-20', 21, 'Latest')
    const olderItems = createApodItems('2026-02-27', 5, 'Older')
    const customItem = createApodItems('2026-01-05', 1, 'Custom')
    const loadMoreDeferred = createDeferred<ApodItem[]>()

    mockedFetchApi
      .mockResolvedValueOnce(latestItems)
      .mockImplementationOnce(() => loadMoreDeferred.promise)
      .mockResolvedValueOnce(customItem)

    const { result, rerender } = renderHook(
      ({ options }: { options?: Parameters<typeof useApod>[0] }) => useApod(options),
      {
        initialProps: { options: {} },
      },
    )

    await waitFor(() => expect(result.current.items).toEqual(latestItems))
    expect(result.current.hasMore).toBe(true)

    act(() => {
      result.current.loadMore()
    })

    await waitFor(() => expect(mockedFetchApi).toHaveBeenCalledTimes(2))

    rerender({
      options: {
        date: '2026-01-05',
      },
    })

    await waitFor(() => expect(result.current.items).toEqual(customItem))
    expect(result.current.hasMore).toBe(false)

    await act(async () => {
      loadMoreDeferred.resolve(olderItems)
      await loadMoreDeferred.promise
    })

    expect(result.current.items).toEqual(customItem)
    expect(result.current.hasMore).toBe(false)
    expect(result.current.error).toBeNull()
  })
})
