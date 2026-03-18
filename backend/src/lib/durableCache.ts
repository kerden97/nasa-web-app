import { Redis } from '@upstash/redis'
import { config } from '../config'
import logger from './logger'

const KEY_PREFIX = 'home-and-beyond:v1'

function encodeKeyPart(part: string): string {
  return encodeURIComponent(part)
}

export function buildDurableCacheKey(...parts: string[]): string {
  return [KEY_PREFIX, ...parts.map(encodeKeyPart)].join(':')
}

class DurableCache {
  private client: Redis | null = null
  private readonly enabled: boolean

  constructor() {
    this.enabled = config.redis.enabled

    if (!this.enabled) {
      logger.info('Durable Redis cache disabled')
      return
    }

    this.client = new Redis({
      url: config.redis.url,
      token: config.redis.token,
    })
    logger.info('Durable Redis cache enabled')
  }

  async get<T>(key: string): Promise<T | null> {
    if (!this.enabled || !this.client) return null

    try {
      const value = await this.client.get<T>(key)
      return value ?? null
    } catch (error) {
      logger.warn('Durable cache get failed', { key, error })
      return null
    }
  }

  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    if (!this.enabled || !this.client || ttlSeconds <= 0) return

    try {
      await this.client.set(key, value, { ex: ttlSeconds })
    } catch (error) {
      logger.warn('Durable cache set failed', { key, error })
    }
  }
}

export const durableCache = new DurableCache()
