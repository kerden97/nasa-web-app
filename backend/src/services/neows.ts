import { config } from '../config'
import { buildDurableCacheKey, durableCache } from '../lib/durableCache'
import logger from '../lib/logger'
import type { NeoFeedResult, NeoObject, NeoCloseApproach } from '../types/neows'

const BASE_URL = `${config.nasa.baseUrl}/neo/rest/v1`

const feedCache = new Map<string, { result: NeoFeedResult; cachedDate: string }>()
const failedKeys = new Map<string, { timestamp: number; message: string }>()
const FAIL_COOLDOWN_MS = 10 * 60 * 1000
const MAX_RETRIES = 3
const RETRY_STATUSES = new Set([500, 502, 503, 504])
const NEOWS_FRESH_TTL_SECONDS = 15 * 60
const NEOWS_HISTORICAL_TTL_SECONDS = 24 * 60 * 60

const inflight = new Map<string, Promise<NeoFeedResult>>()

function todayUTC(): string {
  return new Date().toISOString().split('T')[0]!
}

function cacheKey(startDate: string, endDate: string): string {
  return `${startDate}:${endDate}`
}

interface NasaNeoApiResponse {
  element_count: number
  near_earth_objects: Record<
    string,
    {
      id: string
      name: string
      nasa_jpl_url: string
      absolute_magnitude_h: number
      estimated_diameter: {
        kilometers: { estimated_diameter_min: number; estimated_diameter_max: number }
        meters: { estimated_diameter_min: number; estimated_diameter_max: number }
      }
      is_potentially_hazardous_asteroid: boolean
      close_approach_data: {
        close_approach_date: string
        close_approach_date_full: string
        epoch_date_close_approach: number
        relative_velocity: {
          kilometers_per_second: string
          kilometers_per_hour: string
          miles_per_hour: string
        }
        miss_distance: {
          astronomical: string
          lunar: string
          kilometers: string
          miles: string
        }
        orbiting_body: string
      }[]
      is_sentry_object: boolean
    }[]
  >
}

function mapResponse(data: NasaNeoApiResponse): NeoFeedResult {
  const near_earth_objects: Record<string, NeoObject[]> = {}

  for (const [date, neos] of Object.entries(data.near_earth_objects)) {
    near_earth_objects[date] = neos.map((neo) => {
      const approaches: NeoCloseApproach[] = neo.close_approach_data.map((ca) => ({
        close_approach_date: ca.close_approach_date,
        close_approach_date_full: ca.close_approach_date_full,
        epoch_date_close_approach: ca.epoch_date_close_approach,
        relative_velocity: {
          kilometers_per_second: ca.relative_velocity.kilometers_per_second,
          kilometers_per_hour: ca.relative_velocity.kilometers_per_hour,
          miles_per_hour: ca.relative_velocity.miles_per_hour,
        },
        miss_distance: {
          astronomical: ca.miss_distance.astronomical,
          lunar: ca.miss_distance.lunar,
          kilometers: ca.miss_distance.kilometers,
          miles: ca.miss_distance.miles,
        },
        orbiting_body: ca.orbiting_body,
      }))

      return {
        id: neo.id,
        name: neo.name,
        nasa_jpl_url: neo.nasa_jpl_url,
        absolute_magnitude_h: neo.absolute_magnitude_h,
        estimated_diameter: {
          kilometers: neo.estimated_diameter.kilometers,
          meters: neo.estimated_diameter.meters,
        },
        is_potentially_hazardous_asteroid: neo.is_potentially_hazardous_asteroid,
        close_approach_data: approaches,
        is_sentry_object: neo.is_sentry_object,
      }
    })
  }

  return { element_count: data.element_count, near_earth_objects }
}

async function fetchFromNasa(
  startDate: string,
  endDate: string,
  key: string,
): Promise<NeoFeedResult> {
  const existing = inflight.get(key)
  if (existing) {
    logger.info('Deduplicating in-flight NeoWs request', { key })
    return existing
  }

  const promise = (async () => {
    const params = new URLSearchParams({
      start_date: startDate,
      end_date: endDate,
      api_key: config.nasa.apiKey,
    })

    const url = `${BASE_URL}/feed?${params.toString()}`

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      logger.info('Fetching NeoWs feed', { startDate, endDate, attempt })

      let response: Response
      try {
        response = await fetch(url)
      } catch (error) {
        if (attempt >= MAX_RETRIES) throw error
        const message = error instanceof Error ? error.message : 'Unknown fetch error'
        const delay = attempt * 1000
        logger.warn('NeoWs fetch failed, retrying', { attempt, retryIn: `${delay}ms`, message })
        await new Promise((r) => setTimeout(r, delay))
        continue
      }

      if (!response.ok) {
        const body = await response.text()

        if (RETRY_STATUSES.has(response.status) && attempt < MAX_RETRIES) {
          const delay = attempt * 1000
          logger.warn('NeoWs API transient error, retrying', {
            status: response.status,
            attempt,
            retryIn: `${delay}ms`,
          })
          await new Promise((r) => setTimeout(r, delay))
          continue
        }
        logger.error('NeoWs API error', { status: response.status, body })
        throw new Error(`NASA NeoWs API responded with ${response.status}`)
      }

      const data: NasaNeoApiResponse = await response.json()
      const result = mapResponse(data)

      feedCache.set(key, { result, cachedDate: todayUTC() })
      return result
    }

    throw new Error('NeoWs retry loop exited unexpectedly')
  })()

  inflight.set(key, promise)
  const cleanup = () => inflight.delete(key)
  promise.then(cleanup, cleanup)

  return promise
}

export async function fetchNeoFeed(startDate: string, endDate: string): Promise<NeoFeedResult> {
  const key = cacheKey(startDate, endDate)
  const durableKey = buildDurableCacheKey('neows', 'feed', startDate, endDate)
  const durableHit = await durableCache.get<NeoFeedResult>(durableKey)
  if (durableHit) {
    logger.info('NeoWs durable cache hit', { key: durableKey })
    feedCache.set(key, { result: durableHit, cachedDate: todayUTC() })
    return durableHit
  }

  // Past date ranges are stable; ranges including today or later
  // invalidate daily since new close approach data can appear
  const cached = feedCache.get(key)
  if (cached) {
    const isNonHistoricalRange = endDate >= todayUTC()
    if (!isNonHistoricalRange || cached.cachedDate === todayUTC()) {
      logger.info('NeoWs cache hit', { key })
      return cached.result
    }
  }

  const lastFail = failedKeys.get(key)
  if (lastFail && Date.now() - lastFail.timestamp < FAIL_COOLDOWN_MS) {
    const stale = feedCache.get(key)
    if (stale) {
      logger.warn('NeoWs key in cooldown, serving stale cache', { key })
      return stale.result
    }
    logger.info('Skipping fetch — NeoWs key in cooldown', { key })
    throw new Error(lastFail.message)
  }

  try {
    const result = await fetchFromNasa(startDate, endDate, key)
    failedKeys.delete(key)
    await durableCache.set(
      durableKey,
      result,
      endDate >= todayUTC() ? NEOWS_FRESH_TTL_SECONDS : NEOWS_HISTORICAL_TTL_SECONDS,
    )
    return result
  } catch (error) {
    const message = error instanceof Error ? error.message : 'NASA NeoWs API error'
    failedKeys.set(key, { timestamp: Date.now(), message })

    // Stale cache fallback
    const stale = feedCache.get(key)
    if (stale) {
      logger.warn('NeoWs API failed, serving stale cache', { key })
      return stale.result
    }

    throw error
  }
}
