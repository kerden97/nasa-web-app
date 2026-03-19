import { afterEach, describe, expect, it } from 'vitest'
import { z } from 'zod'
import {
  createPersistedCacheKey,
  readPersistedCache,
  writePersistedCache,
} from '@/lib/persistedClientCache'

describe('persistedClientCache', () => {
  afterEach(() => {
    localStorage.clear()
  })

  it('reads back stored values by generated cache key', () => {
    const key = createPersistedCacheKey('apod', 'latest-list')
    writePersistedCache(key, { date: '2026-03-18' })

    expect(readPersistedCache<{ date: string }>(key)).toEqual({ date: '2026-03-18' })
  })

  it('clears corrupted cached values instead of throwing', () => {
    const key = createPersistedCacheKey('epic', 'dates', 'natural')
    localStorage.setItem(key, '{not-valid-json')

    expect(readPersistedCache<string[]>(key)).toBeNull()
    expect(localStorage.getItem(key)).toBeNull()
  })

  it('clears cached values that fail schema validation', () => {
    const key = createPersistedCacheKey('neows', 'feed', '2026-03-12', '2026-03-18')
    writePersistedCache(key, { date: '2026-03-18' })

    expect(
      readPersistedCache(
        key,
        z.object({
          date: z.number(),
        }),
      ),
    ).toBeNull()
    expect(localStorage.getItem(key)).toBeNull()
  })
})
