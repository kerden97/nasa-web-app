import { config } from '../config'
import logger from '../lib/logger'
import type { ApodItem, ApodQuery } from '../types/apod'

// Per-date in-memory cache — past dates are immutable, today invalidates on date rollover
const cache = new Map<string, ApodItem>()
const failedDates = new Map<string, { timestamp: number; message: string }>() // date → last failure info
const FAIL_COOLDOWN_MS = 10 * 60 * 1000 // don't retry a failed date for 10 minutes
let cachedTodayDate = '' // which date string was cached as "today"

function todayUTC(): string {
  return new Date().toISOString().split('T')[0]!
}

function getCached(date: string): ApodItem | undefined {
  const item = cache.get(date)
  if (!item) return undefined
  // Today's cache is valid until the date rolls over (midnight UTC)
  if (date === cachedTodayDate && cachedTodayDate !== todayUTC()) {
    return undefined // date changed — refetch
  }
  return item
}

function setCached(item: ApodItem): void {
  cache.set(item.date, item)
  if (item.date === todayUTC()) cachedTodayDate = item.date
}

function buildApodUrl(query: ApodQuery): string {
  const params = new URLSearchParams({
    api_key: config.nasa.apiKey,
    thumbs: 'true',
  })

  if (query.date) {
    params.set('date', query.date)
  } else if (query.start_date) {
    params.set('start_date', query.start_date)
    if (query.end_date) {
      params.set('end_date', query.end_date)
    }
  }

  return `${config.nasa.baseUrl}/planetary/apod?${params.toString()}`
}

function formatDate(d: Date): string {
  const iso = d.toISOString().split('T')[0]
  if (!iso) throw new Error('Failed to format date')
  return iso
}

const APOD_EPOCH = '1995-06-16'
const DEFAULT_COUNT = 20

function subtractDays(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() - days)
  return formatDate(d)
}

function clampApodDate(iso: string): string {
  const today = todayUTC()
  if (iso < APOD_EPOCH) return APOD_EPOCH
  if (iso > today) return today
  return iso
}

function isNasaApiError(error: unknown): error is Error {
  return error instanceof Error && error.message.includes('NASA API')
}

function shouldFallbackLatestDate(date: string, error: unknown): boolean {
  return isNasaApiError(error) && date >= todayUTC() && date > APOD_EPOCH
}

// In-flight request deduplication — prevents concurrent identical NASA API calls
const inflight = new Map<string, Promise<ApodItem[]>>()

async function fetchFromNasa(query: ApodQuery): Promise<ApodItem[]> {
  const url = buildApodUrl(query)

  // Deduplicate concurrent requests for the same URL
  const existing = inflight.get(url)
  if (existing) {
    logger.info('Deduplicating in-flight NASA API request', {
      date: query.date,
      start_date: query.start_date,
      end_date: query.end_date,
    })
    return existing
  }

  const promise = (async () => {
    const MAX_RETRIES = 3
    // NASA 500 "Internal Service Error" is often transient (API bugs, not missing data)
    const RETRY_STATUSES = new Set([500, 502, 503, 504])

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      logger.info('Fetching APOD from NASA API', {
        date: query.date,
        start_date: query.start_date,
        end_date: query.end_date,
        attempt,
      })

      const response = await fetch(url)

      if (!response.ok) {
        const body = await response.text()

        if (RETRY_STATUSES.has(response.status) && attempt < MAX_RETRIES) {
          const delay = attempt * 1000
          logger.warn('NASA API transient error, retrying', {
            status: response.status,
            attempt,
            retryIn: `${delay}ms`,
          })
          await new Promise((r) => setTimeout(r, delay))
          continue
        }
        logger.error('NASA APOD API error', { status: response.status, body })
        throw new Error(`NASA API responded with ${response.status}`)
      }

      const data = await response.json()
      const items: ApodItem[] = Array.isArray(data) ? data : [data]

      items.forEach(setCached)
      return items
    }

    throw new Error('NASA API failed after retries')
  })()

  inflight.set(url, promise)
  const cleanup = () => inflight.delete(url)
  promise.then(cleanup, cleanup)

  return promise
}

export async function fetchApod(query: ApodQuery): Promise<ApodItem | ApodItem[]> {
  // Single date — check cache and cooldown first
  if (query.date) {
    return fetchSingleDate(query.date)
  }

  // Explicit range without count — serve as-is
  if (query.start_date && !query.count) {
    const startDate = clampApodDate(query.start_date)
    const endDate = clampApodDate(query.end_date ?? todayUTC())
    return fetchRange(startDate, endDate)
  }

  // Fill to exact count (default load or load-more with end_date + count)
  const target = query.count ?? DEFAULT_COUNT
  const endDate = clampApodDate(query.end_date ?? todayUTC())
  return fetchExactCount(endDate, target)
}

async function fetchSingleDate(date: string, allowLatestFallback = true): Promise<ApodItem> {
  const normalizedDate = clampApodDate(date)
  const cached = getCached(normalizedDate)
  if (cached) {
    logger.info('APOD cache hit', { date: normalizedDate })
    return cached
  }

  const lastFail = failedDates.get(normalizedDate)
  if (lastFail && Date.now() - lastFail.timestamp < FAIL_COOLDOWN_MS) {
    logger.info('Skipping fetch — date in cooldown', { date: normalizedDate })
    if (allowLatestFallback && normalizedDate > APOD_EPOCH && normalizedDate >= todayUTC()) {
      return fetchSingleDate(subtractDays(normalizedDate, 1), false)
    }
    throw new Error(lastFail.message)
  }

  try {
    const items = await fetchFromNasa({ date: normalizedDate })
    failedDates.delete(normalizedDate)
    return items[0]!
  } catch (error) {
    const message = error instanceof Error ? error.message : 'NASA API error'
    failedDates.set(normalizedDate, { timestamp: Date.now(), message })

    if (allowLatestFallback && shouldFallbackLatestDate(normalizedDate, error)) {
      const fallbackDate = subtractDays(normalizedDate, 1)
      logger.warn('Latest APOD date unavailable, falling back to previous day', {
        requestedDate: normalizedDate,
        fallbackDate,
      })
      return fetchSingleDate(fallbackDate, false)
    }

    throw error
  }
}

async function fetchRange(startDate: string, endDate: string): Promise<ApodItem[]> {
  const dates = getDateRange(startDate, endDate)

  // Partition into cached and uncached dates
  const cached: ApodItem[] = []
  const uncachedDates: string[] = []
  for (const d of dates) {
    const item = getCached(d)
    if (item) {
      cached.push(item)
    } else {
      uncachedDates.push(d)
    }
  }

  if (uncachedDates.length === 0) {
    logger.info('APOD cache hit (full range)', { start_date: startDate, end_date: endDate })
    return cached.reverse()
  }

  logger.info('APOD partial cache hit', {
    start_date: startDate,
    end_date: endDate,
    cachedCount: cached.length,
    uncachedCount: uncachedDates.length,
  })

  // Only fetch the uncached portion from NASA
  const fetchStart = uncachedDates[0]!
  const fetchEnd = uncachedDates[uncachedDates.length - 1]!

  try {
    const fresh = await fetchFromNasa({ start_date: fetchStart, end_date: fetchEnd })

    // Merge: build full list from cache + fresh keyed by date
    const byDate = new Map<string, ApodItem>()
    for (const item of cached) byDate.set(item.date, item)
    for (const item of fresh) byDate.set(item.date, item)
    return dates
      .map((d) => byDate.get(d))
      .filter((item): item is ApodItem => !!item)
      .reverse()
  } catch (error) {
    if (shouldFallbackLatestDate(endDate, error)) {
      const fallbackEnd = subtractDays(endDate, 1)
      logger.warn('Latest APOD range end unavailable, retrying without newest day', {
        start_date: startDate,
        requestedEnd: endDate,
        fallbackEnd,
      })
      if (fallbackEnd < startDate) {
        return [await fetchSingleDate(fallbackEnd, false)]
      }
      return fetchRange(startDate, fallbackEnd)
    }

    // Fallback: serve any cached items we already have for the range
    const staleItems = dates.map((d) => cache.get(d)).filter((item): item is ApodItem => !!item)
    if (staleItems.length > 0) {
      logger.warn('NASA API failed, serving stale cache for range', {
        start_date: startDate,
        end_date: endDate,
        staleCount: staleItems.length,
      })
      return staleItems.reverse()
    }
    throw error
  }
}

async function fetchExactCount(endDate: string, target: number): Promise<ApodItem[]> {
  const collected: ApodItem[] = []
  let cursor = endDate
  const batchDays = target + 5 // over-fetch to account for gaps

  while (collected.length < target && cursor >= APOD_EPOCH) {
    const startDate =
      subtractDays(cursor, batchDays - 1) < APOD_EPOCH
        ? APOD_EPOCH
        : subtractDays(cursor, batchDays - 1)

    const batch = await fetchRange(startDate, cursor)
    collected.push(...batch)

    if (startDate <= APOD_EPOCH) break
    cursor = subtractDays(startDate, 1)
  }

  return collected.slice(0, target)
}

/**
 * Warm the cache on startup so the first user request is fast.
 * Runs in the background — failures are silently logged.
 */
export function prefetchLatest(): void {
  const end = todayUTC()
  const start = subtractDays(end, 25)
  logger.info('Prefetching latest APOD range', { start_date: start, end_date: end })
  fetchFromNasa({ start_date: start, end_date: end })
    .then((items) => logger.info('Prefetch complete', { count: items.length }))
    .catch((err: Error) => logger.warn('Prefetch failed (non-fatal)', { error: err.message }))
}

function getDateRange(start: string, end: string): string[] {
  const dates: string[] = []
  const current = new Date(start + 'T00:00:00Z')
  const last = new Date(end + 'T00:00:00Z')

  while (current <= last) {
    dates.push(formatDate(current))
    current.setUTCDate(current.getUTCDate() + 1)
  }

  return dates
}
