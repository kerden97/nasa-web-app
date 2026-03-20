import { buildDurableCacheKey, durableCache } from '../lib/durableCache'
import { todayUTC } from '../lib/date'
import logger from '../lib/logger'
import { fetchUpstreamJson } from '../lib/upstreamService'
import type { EpicImage, EpicCollection } from '../types/epic'

// Image cache: "collection:date|latest" → { images, cachedDate }
// Dates cache: "collection" → { dates, cachedDate }
const cache = new Map<string, { images: EpicImage[]; cachedDate: string }>()
const datesCache = new Map<string, { dates: string[]; cachedDate: string }>()
const failedKeys = new Map<string, { timestamp: number; message: string }>()
const FAIL_COOLDOWN_MS = 10 * 60 * 1000 // don't retry a failed key for 10 minutes
const EPIC_LATEST_TTL_SECONDS = 15 * 60
const EPIC_HISTORICAL_TTL_SECONDS = 30 * 24 * 60 * 60

const EPIC_API_BASE_URL = 'https://epic.gsfc.nasa.gov/api'
const EPIC_ARCHIVE_BASE_URL = 'https://epic.gsfc.nasa.gov/archive'

// In-flight request deduplication
const inflight = new Map<string, Promise<EpicImage[]>>()
const inflightDates = new Map<string, Promise<string[]>>()

interface EpicApiItem {
  identifier: string
  caption: string
  image: string
  date: string
  centroid_coordinates: {
    lat: number
    lon: number
  }
}

function buildImageUrl(image: string, date: string, collection: EpicCollection): string {
  const [year, month, day] = date.split(' ')[0]!.split('-')
  return `${EPIC_ARCHIVE_BASE_URL}/${collection}/${year}/${month}/${day}/jpg/${image}.jpg`
}

async function fetchImagesFromNasa(
  collection: EpicCollection,
  date: string | undefined,
  key: string,
): Promise<EpicImage[]> {
  // Deduplicate concurrent requests
  const existing = inflight.get(key)
  if (existing) {
    logger.info('Deduplicating in-flight EPIC images request', { key })
    return existing
  }

  const promise = (async () => {
    const datePath = date ? `/date/${date}` : ''
    const url = `${EPIC_API_BASE_URL}/${collection}${datePath}`
    const data = await fetchUpstreamJson<EpicApiItem[]>(url, {
      serviceName: 'NASA EPIC API',
      requestLog: 'Fetching EPIC images',
      transientRetryLog: 'EPIC API transient error, retrying',
      networkRetryLog: 'EPIC API network error, retrying',
      errorLog: 'EPIC API error',
      context: {
        collection,
        date: date ?? 'latest',
      },
    })

    const images: EpicImage[] = data.map((item) => ({
      identifier: item.identifier,
      caption: item.caption,
      image: buildImageUrl(item.image, item.date, collection),
      date: item.date,
      centroid_coordinates: item.centroid_coordinates,
    }))

    if (images.length > 0) {
      cache.set(key, { images, cachedDate: todayUTC() })
    }
    return images
  })()

  inflight.set(key, promise)
  const cleanup = () => inflight.delete(key)
  promise.then(cleanup, cleanup)

  return promise
}

async function fetchDatesFromNasa(collection: EpicCollection): Promise<string[]> {
  // Deduplicate concurrent requests
  const existing = inflightDates.get(collection)
  if (existing) {
    logger.info('Deduplicating in-flight EPIC dates request', { collection })
    return existing
  }

  const promise = (async () => {
    const url = `${EPIC_API_BASE_URL}/${collection}/all`
    const data = await fetchUpstreamJson<{ date: string }[]>(url, {
      serviceName: 'NASA EPIC API',
      requestLog: 'Fetching EPIC available dates',
      transientRetryLog: 'EPIC dates API transient error, retrying',
      networkRetryLog: 'EPIC dates API network error, retrying',
      errorLog: 'EPIC dates API error',
      context: { collection },
    })
    const dates = data
      .map((d) => d.date)
      .sort()
      .reverse()

    datesCache.set(collection, { dates, cachedDate: todayUTC() })
    return dates
  })()

  inflightDates.set(collection, promise)
  const cleanup = () => inflightDates.delete(collection)
  promise.then(cleanup, cleanup)

  return promise
}

export async function fetchEpicImages(
  collection: EpicCollection,
  date?: string,
): Promise<EpicImage[]> {
  const key = `${collection}:${date ?? 'latest'}`
  const durableKey = buildDurableCacheKey('epic', 'images', collection, date ?? 'latest')
  const durableHit = await durableCache.get<EpicImage[]>(durableKey)
  if (durableHit?.length) {
    logger.info('EPIC durable cache hit', { key: durableKey })
    cache.set(key, { images: durableHit, cachedDate: todayUTC() })
    return durableHit
  }

  // "latest" (no date) invalidates daily — new images appear each day
  const cached = cache.get(key)
  if (cached) {
    const isLatest = !date
    if (!isLatest || cached.cachedDate === todayUTC()) {
      logger.info('EPIC cache hit', { key })
      return cached.images
    }
  }

  // Don't retry a key that recently failed
  const lastFail = failedKeys.get(key)
  if (lastFail && Date.now() - lastFail.timestamp < FAIL_COOLDOWN_MS) {
    logger.info('Skipping fetch — EPIC key in cooldown', { key })
    throw new Error(lastFail.message)
  }

  try {
    const images = await fetchImagesFromNasa(collection, date, key)
    failedKeys.delete(key)
    await durableCache.set(
      durableKey,
      images,
      date ? EPIC_HISTORICAL_TTL_SECONDS : EPIC_LATEST_TTL_SECONDS,
    )
    return images
  } catch (error) {
    const message = error instanceof Error ? error.message : 'NASA EPIC API error'
    failedKeys.set(key, { timestamp: Date.now(), message })

    // Stale cache fallback
    const stale = cache.get(key)
    if (stale) {
      logger.warn('EPIC API failed, serving stale cache', { key })
      return stale.images
    }

    throw error
  }
}

export async function fetchEpicDates(collection: EpicCollection): Promise<string[]> {
  const durableKey = buildDurableCacheKey('epic', 'dates', collection)
  const durableHit = await durableCache.get<string[]>(durableKey)
  if (durableHit?.length) {
    logger.info('EPIC dates durable cache hit', { collection })
    datesCache.set(collection, { dates: durableHit, cachedDate: todayUTC() })
    return durableHit
  }

  // Dates cache invalidates daily — new dates appear each day
  const cached = datesCache.get(collection)
  if (cached && cached.cachedDate === todayUTC()) {
    logger.info('EPIC dates cache hit', { collection })
    return cached.dates
  }

  const failKey = `dates:${collection}`
  const lastFail = failedKeys.get(failKey)
  if (lastFail && Date.now() - lastFail.timestamp < FAIL_COOLDOWN_MS) {
    logger.info('Skipping fetch — EPIC dates in cooldown', { collection })
    throw new Error(lastFail.message)
  }

  try {
    const dates = await fetchDatesFromNasa(collection)
    failedKeys.delete(failKey)
    await durableCache.set(durableKey, dates, EPIC_LATEST_TTL_SECONDS)
    return dates
  } catch (error) {
    const message = error instanceof Error ? error.message : 'NASA EPIC dates error'
    failedKeys.set(failKey, { timestamp: Date.now(), message })

    // Stale cache fallback
    const stale = datesCache.get(collection)
    if (stale) {
      logger.warn('EPIC dates API failed, serving stale cache', { collection })
      return stale.dates
    }

    throw error
  }
}
