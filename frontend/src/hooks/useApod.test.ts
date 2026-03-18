import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useApod } from '@/hooks/useApod'
import { fetchApi } from '@/lib/api'
import { createPersistedCacheKey, writePersistedCache } from '@/lib/persistedClientCache'
import type { ApodItem } from '@/types/apod'

vi.mock('@/lib/api', () => ({
  fetchApi: vi.fn(),
}))

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
})
