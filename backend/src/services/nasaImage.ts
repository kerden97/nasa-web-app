import { buildDurableCacheKey, durableCache } from '../lib/durableCache'
import logger from '../lib/logger'
import { fetchUpstreamJson } from '../lib/upstreamService'
import type { NasaImageItem, NasaImageMediaAssetResult, NasaImageQuery } from '../types/nasaImage'

// NASA Image and Video Library — no API key required
const BASE_URL = 'https://images-api.nasa.gov'

const searchCache = new Map<string, { items: NasaImageItem[]; totalHits: number }>()
const failedQueries = new Map<string, { timestamp: number; message: string }>()
const FAIL_COOLDOWN_MS = 10 * 60 * 1000 // don't retry a failed query for 10 minutes
const NASA_IMAGE_TTL_SECONDS = 60 * 60
const NASA_IMAGE_ASSET_TTL_SECONDS = 60 * 60
const assetCache = new Map<string, NasaImageMediaAssetResult>()
const inflightAssetRequests = new Map<string, Promise<NasaImageMediaAssetResult>>()

// In-flight request deduplication — prevents concurrent identical API calls
const inflight = new Map<string, Promise<{ items: NasaImageItem[]; totalHits: number }>>()
const NASA_IMAGE_ASSET_HOST = 'images-assets.nasa.gov'
const NASA_IMAGE_ASSET_PATH_PREFIXES = ['/image/', '/video/', '/audio/'] as const

function cacheKey(query: NasaImageQuery): string {
  return `${query.q}:${query.media_type ?? ''}:${query.year_start ?? ''}:${query.year_end ?? ''}:${query.page ?? 1}`
}

interface NasaSearchResponse {
  collection: {
    items: {
      href?: string
      data: {
        nasa_id: string
        title: string
        description?: string
        date_created: string
        media_type: 'image' | 'video' | 'audio'
        center?: string
        keywords?: string[]
      }[]
      links?: { href: string; rel: string }[]
    }[]
    metadata: { total_hits: number }
  }
}

function normalizeNasaAssetManifestUrl(sourceUrl: string): string | null {
  try {
    const parsed = new URL(sourceUrl)
    if (parsed.protocol !== 'https:') return null
    if (parsed.hostname !== NASA_IMAGE_ASSET_HOST) return null
    if (parsed.search || parsed.hash) return null

    const matchesPrefix = NASA_IMAGE_ASSET_PATH_PREFIXES.some((prefix) =>
      parsed.pathname.startsWith(prefix),
    )
    if (!matchesPrefix) return null
    if (!parsed.pathname.endsWith('/collection.json')) return null

    return parsed.toString()
  } catch {
    return null
  }
}

export function isSupportedNasaAssetManifestSource(
  sourceUrl: string | undefined,
): sourceUrl is string {
  return typeof sourceUrl === 'string' && normalizeNasaAssetManifestUrl(sourceUrl) !== null
}

function normalizeManifestAssets(assets: string[]): string[] {
  const normalized = assets
    .filter((asset): asset is string => typeof asset === 'string' && asset.length > 0)
    .map((asset) => asset.replace(/^http:\/\//i, 'https://'))

  return [...new Set(normalized)]
}

function pickPreferredMediaAsset(assets: string[], mediaType: 'video' | 'audio'): string | null {
  const videoCandidates = ['~orig.mp4', '.mp4', '.m4v', '.mov', '.webm']
  const audioCandidates = ['.mp3', '.m4a', '.wav']
  const candidates = mediaType === 'video' ? videoCandidates : audioCandidates

  for (const suffix of candidates) {
    const match = assets.find((asset) => asset.toLowerCase().endsWith(suffix))
    if (match) return match
  }

  return null
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&nbsp;/gi, ' ')
}

function sanitizeDescription(description: string | undefined): string {
  if (!description) return ''

  const withoutHtml = decodeHtmlEntities(description)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>\s*<p>/gi, '\n\n')
    .replace(/<[^>]+>/g, ' ')

  const cutoffPatterns = [
    /\bImage credit:/i,
    /\bNASA image use policy\b/i,
    /\bNASA Goddard Space Flight Center\b/i,
    /\bFollow us on\b/i,
    /\bLike us on\b/i,
    /\bFind us on\b/i,
  ]

  let cleaned = withoutHtml
  for (const pattern of cutoffPatterns) {
    const match = pattern.exec(cleaned)
    if (match && typeof match.index === 'number') {
      cleaned = cleaned.slice(0, match.index)
      break
    }
  }

  return cleaned.replace(/\s+/g, ' ').trim()
}

function mapResponse(data: NasaSearchResponse): { items: NasaImageItem[]; totalHits: number } {
  const items: NasaImageItem[] = data.collection.items
    .filter((entry) => entry.data[0])
    .map((entry) => {
      const d = entry.data[0]!
      const thumbnail = entry.links?.find((l) => l.rel === 'preview')?.href ?? ''
      const result: NasaImageItem = {
        nasa_id: d.nasa_id,
        title: d.title,
        description: sanitizeDescription(d.description),
        date_created: d.date_created,
        media_type: d.media_type,
        href: thumbnail,
      }
      if (typeof entry.href === 'string') result.asset_manifest_url = entry.href
      if (d.center) result.center = d.center
      if (d.keywords) result.keywords = d.keywords
      return result
    })

  return { items, totalHits: data.collection.metadata.total_hits }
}

async function fetchFromNasa(
  query: NasaImageQuery,
  key: string,
): Promise<{ items: NasaImageItem[]; totalHits: number }> {
  // Deduplicate concurrent requests for the same query
  const existing = inflight.get(key)
  if (existing) {
    logger.info('Deduplicating in-flight NASA Image Library request', { key })
    return existing
  }

  const promise = (async () => {
    const params = new URLSearchParams({ q: query.q })
    if (query.media_type) params.set('media_type', query.media_type)
    if (query.year_start) params.set('year_start', query.year_start)
    if (query.year_end) params.set('year_end', query.year_end)
    params.set('page', String(query.page ?? 1))

    const url = `${BASE_URL}/search?${params.toString()}`
    const data = await fetchUpstreamJson<NasaSearchResponse>(url, {
      serviceName: 'NASA Image Library',
      requestLog: 'Searching NASA Image Library',
      transientRetryLog: 'NASA Image Library transient error, retrying',
      networkRetryLog: 'NASA Image Library network error, retrying',
      errorLog: 'NASA Image Library API error',
      context: {
        q: query.q,
        page: query.page ?? 1,
      },
    })
    const result = mapResponse(data)

    searchCache.set(key, result)
    return result
  })()

  inflight.set(key, promise)
  const cleanup = () => inflight.delete(key)
  promise.then(cleanup, cleanup)

  return promise
}

export async function searchNasaImages(
  query: NasaImageQuery,
): Promise<{ items: NasaImageItem[]; totalHits: number }> {
  const key = cacheKey(query)
  const durableKey = buildDurableCacheKey(
    'nasa-image',
    query.q,
    query.media_type ?? '',
    query.year_start ?? '',
    query.year_end ?? '',
    String(query.page ?? 1),
  )
  const durableHit = await durableCache.get<{ items: NasaImageItem[]; totalHits: number }>(
    durableKey,
  )
  if (durableHit) {
    logger.info('NASA Image Library durable cache hit', { key: durableKey })
    searchCache.set(key, durableHit)
    return durableHit
  }

  const cached = searchCache.get(key)
  if (cached) {
    logger.info('NASA Image Library cache hit', { key })
    return cached
  }

  // Don't retry a query that recently failed
  const lastFail = failedQueries.get(key)
  if (lastFail && Date.now() - lastFail.timestamp < FAIL_COOLDOWN_MS) {
    logger.info('Skipping fetch — query in cooldown', { key })
    throw new Error(lastFail.message)
  }

  try {
    const result = await fetchFromNasa(query, key)
    failedQueries.delete(key) // success — clear cooldown
    await durableCache.set(durableKey, result, NASA_IMAGE_TTL_SECONDS)
    return result
  } catch (error) {
    const message = error instanceof Error ? error.message : 'NASA Image Library error'
    failedQueries.set(key, { timestamp: Date.now(), message })
    throw error
  }
}

export async function fetchNasaMediaAssets(
  sourceUrl: string,
  mediaType: 'video' | 'audio',
): Promise<NasaImageMediaAssetResult> {
  const normalizedSourceUrl = normalizeNasaAssetManifestUrl(sourceUrl)
  if (!normalizedSourceUrl) {
    throw new Error('Unsupported NASA Image Library asset manifest source')
  }

  const cacheKey = `${normalizedSourceUrl}:${mediaType}`
  const durableKey = buildDurableCacheKey('nasa-image-assets', normalizedSourceUrl, mediaType)
  const durableHit = await durableCache.get<NasaImageMediaAssetResult>(durableKey)
  if (durableHit) {
    logger.info('NASA Image Library asset durable cache hit', { key: durableKey })
    assetCache.set(cacheKey, durableHit)
    return durableHit
  }

  const cached = assetCache.get(cacheKey)
  if (cached) {
    logger.info('NASA Image Library asset cache hit', { key: cacheKey })
    return cached
  }

  const existing = inflightAssetRequests.get(cacheKey)
  if (existing) {
    logger.info('Deduplicating in-flight NASA Image Library asset request', { key: cacheKey })
    return existing
  }

  const promise = (async () => {
    const manifest = await fetchUpstreamJson<string[]>(normalizedSourceUrl, {
      serviceName: 'NASA Image Library asset manifest',
      requestLog: 'Fetching NASA Image Library asset manifest',
      transientRetryLog: 'NASA Image Library asset manifest transient error, retrying',
      networkRetryLog: 'NASA Image Library asset manifest network error, retrying',
      errorLog: 'NASA Image Library asset manifest error',
      context: {
        sourceUrl: normalizedSourceUrl,
        mediaType,
      },
    })

    const assets = normalizeManifestAssets(manifest)
    const result: NasaImageMediaAssetResult = {
      assets,
      preferredAsset: pickPreferredMediaAsset(assets, mediaType),
    }

    assetCache.set(cacheKey, result)
    await durableCache.set(durableKey, result, NASA_IMAGE_ASSET_TTL_SECONDS)
    return result
  })()

  inflightAssetRequests.set(cacheKey, promise)
  const cleanup = () => inflightAssetRequests.delete(cacheKey)
  promise.then(cleanup, cleanup)

  return promise
}
