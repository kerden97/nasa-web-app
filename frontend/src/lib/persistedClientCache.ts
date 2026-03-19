import { z } from 'zod'
import { persistedCacheRecordSchema } from '@/schemas/api'

const CACHE_PREFIX = 'home-and-beyond:v1'

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function createPersistedCacheKey(...parts: string[]): string {
  return [CACHE_PREFIX, ...parts].join(':')
}

export function readPersistedCache<T>(key: string, schema?: z.ZodType<T>): T | null {
  const storage = getStorage()
  if (!storage) return null

  try {
    const raw = storage.getItem(key)
    if (!raw) return null

    const parsed = JSON.parse(raw) as unknown
    const recordSchema = persistedCacheRecordSchema(schema ?? z.unknown())
    const result = recordSchema.safeParse(parsed)

    if (!result.success) {
      storage.removeItem(key)
      return null
    }

    return result.data.value as T
  } catch {
    storage.removeItem(key)
    return null
  }
}

export function writePersistedCache<T>(key: string, value: T): void {
  const storage = getStorage()
  if (!storage) return

  try {
    const record = {
      savedAt: Date.now(),
      value,
    }
    storage.setItem(key, JSON.stringify(record))
  } catch {
    // Ignore storage quota and serialization errors; cache is an optimization only.
  }
}
