import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useNeows } from '@/hooks/useNeows'
import { fetchApi } from '@/lib/api'
import { createPersistedCacheKey, writePersistedCache } from '@/lib/persistedClientCache'
import type { NeoFeedResult } from '@/types/neows'

vi.mock('@/lib/api', () => ({
  fetchApi: vi.fn(),
}))

describe('useNeows', () => {
  const mockedFetchApi = vi.mocked(fetchApi)
  const cachedFeed: NeoFeedResult = {
    element_count: 1,
    near_earth_objects: {
      '2026-03-12': [
        {
          id: '1',
          name: '(2026 AB)',
          nasa_jpl_url: 'https://example.com',
          absolute_magnitude_h: 22,
          estimated_diameter: {
            kilometers: { estimated_diameter_min: 0.1, estimated_diameter_max: 0.2 },
            meters: { estimated_diameter_min: 100, estimated_diameter_max: 200 },
          },
          is_potentially_hazardous_asteroid: false,
          close_approach_data: [
            {
              close_approach_date: '2026-03-12',
              close_approach_date_full: '2026-Mar-12 00:00',
              epoch_date_close_approach: 0,
              relative_velocity: {
                kilometers_per_second: '10',
                kilometers_per_hour: '36000',
                miles_per_hour: '22369',
              },
              miss_distance: {
                astronomical: '0.1',
                lunar: '40',
                kilometers: '1000000',
                miles: '621371',
              },
              orbiting_body: 'Earth',
            },
          ],
          is_sentry_object: false,
        },
      ],
    },
  }

  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('shows cached asteroid feed immediately while revalidating', async () => {
    writePersistedCache(
      createPersistedCacheKey('neows', 'feed', '2026-03-12', '2026-03-18'),
      cachedFeed,
    )

    let resolveFetch: ((value: NeoFeedResult) => void) | undefined
    mockedFetchApi.mockImplementation(
      () =>
        new Promise<NeoFeedResult>((resolve) => {
          resolveFetch = resolve
        }),
    )

    const { result } = renderHook(() => useNeows('2026-03-12', '2026-03-18'))

    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.data).toEqual(cachedFeed)

    resolveFetch?.(cachedFeed)
    await waitFor(() => expect(mockedFetchApi).toHaveBeenCalledTimes(1))
  })
})
