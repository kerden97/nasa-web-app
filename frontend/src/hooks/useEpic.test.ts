import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useEpic, useEpicDates } from '@/hooks/useEpic'
import { fetchApi } from '@/lib/api'
import { createPersistedCacheKey, writePersistedCache } from '@/lib/persistedClientCache'
import type { EpicImage } from '@/types/epic'

vi.mock('@/lib/api', () => ({
  fetchApi: vi.fn(),
}))

describe('useEpic', () => {
  const mockedFetchApi = vi.mocked(fetchApi)

  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('shows cached EPIC dates immediately while revalidating', async () => {
    writePersistedCache(createPersistedCacheKey('epic', 'dates', 'natural'), ['2026-03-18'])
    mockedFetchApi.mockResolvedValue(['2026-03-18'])

    const { result } = renderHook(() => useEpicDates('natural'))

    expect(result.current.loading).toBe(false)
    expect(result.current.dates).toEqual(['2026-03-18'])
    expect(result.current.error).toBeNull()
    await waitFor(() => expect(mockedFetchApi).toHaveBeenCalledTimes(1))
  })

  it('surfaces an error when EPIC dates fail without cached data', async () => {
    mockedFetchApi.mockRejectedValue(new Error('Unable to load EPIC date options.'))

    const { result } = renderHook(() => useEpicDates('natural'))

    await waitFor(() => expect(mockedFetchApi).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.dates).toEqual([])
    expect(result.current.error).toBe('Unable to load EPIC date options.')
  })

  it('keeps cached EPIC dates visible when background revalidation fails', async () => {
    writePersistedCache(createPersistedCacheKey('epic', 'dates', 'natural'), ['2026-03-18'])
    mockedFetchApi.mockRejectedValue(new Error('network failure'))

    const { result } = renderHook(() => useEpicDates('natural'))

    await waitFor(() => expect(mockedFetchApi).toHaveBeenCalledTimes(1))
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.dates).toEqual(['2026-03-18'])
  })

  it('keeps cached EPIC images visible when background revalidation fails', async () => {
    const cachedImages: EpicImage[] = [
      {
        identifier: 'epic-1',
        caption: 'Cached EPIC image',
        image: 'epic_1',
        date: '2026-03-18 00:00:00',
        centroid_coordinates: { lat: 0, lon: 0 },
      },
    ]

    writePersistedCache(
      createPersistedCacheKey('epic', 'images', 'natural', '2026-03-18'),
      cachedImages,
    )
    mockedFetchApi.mockRejectedValue(new Error('network failure'))

    const { result } = renderHook(() => useEpic('natural', '2026-03-18'))

    await waitFor(() => expect(mockedFetchApi).toHaveBeenCalledTimes(1))
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.images).toEqual(cachedImages)
  })
})
