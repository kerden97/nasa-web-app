import { createHash } from 'crypto'
import sharp from 'sharp'
import logger from '../lib/logger'

const ALLOWED_APOD_IMAGE_HOSTS = new Set(['apod.nasa.gov'])
const APOD_IMAGE_PATH_PREFIX = '/apod/image/'
const MIN_IMAGE_WIDTH = 240
const MAX_IMAGE_WIDTH = 1600
const MIN_IMAGE_QUALITY = 40
const MAX_IMAGE_QUALITY = 90
const MEMORY_CACHE_TTL_MS = 24 * 60 * 60 * 1000
const MAX_MEMORY_CACHE_ENTRIES = 128

interface OptimizedApodImageAsset {
  buffer: Buffer
  contentType: string
  etag: string
}

interface CachedApodImageAsset extends OptimizedApodImageAsset {
  expiresAt: number
  cachedAt: number
}

const apodImageMemoryCache = new Map<string, CachedApodImageAsset>()
const inflightOptimizations = new Map<string, Promise<OptimizedApodImageAsset>>()

function getCacheKey(sourceUrl: string, width: number, quality: number): string {
  return `${sourceUrl}|w=${width}|q=${quality}`
}

function getCachedImage(cacheKey: string): OptimizedApodImageAsset | null {
  const cached = apodImageMemoryCache.get(cacheKey)
  if (!cached) return null

  if (cached.expiresAt <= Date.now()) {
    apodImageMemoryCache.delete(cacheKey)
    return null
  }

  return {
    buffer: cached.buffer,
    contentType: cached.contentType,
    etag: cached.etag,
  }
}

function setCachedImage(cacheKey: string, asset: OptimizedApodImageAsset): void {
  apodImageMemoryCache.set(cacheKey, {
    ...asset,
    cachedAt: Date.now(),
    expiresAt: Date.now() + MEMORY_CACHE_TTL_MS,
  })

  if (apodImageMemoryCache.size <= MAX_MEMORY_CACHE_ENTRIES) return

  const oldestEntry = [...apodImageMemoryCache.entries()].reduce((oldest, current) =>
    current[1].cachedAt < oldest[1].cachedAt ? current : oldest,
  )
  apodImageMemoryCache.delete(oldestEntry[0])
}

function normalizeApodImageUrl(sourceUrl: string): string | null {
  try {
    const parsed = new URL(sourceUrl)
    if (parsed.protocol !== 'https:') return null
    if (!ALLOWED_APOD_IMAGE_HOSTS.has(parsed.hostname)) return null
    if (!parsed.pathname.startsWith(APOD_IMAGE_PATH_PREFIX)) return null
    return parsed.toString()
  } catch {
    return null
  }
}

export function isOptimizableApodImageSource(sourceUrl: string | undefined): sourceUrl is string {
  return typeof sourceUrl === 'string' && normalizeApodImageUrl(sourceUrl) !== null
}

export function normalizeApodImageWidth(width: number | undefined, fallback: number): number {
  const candidate = typeof width === 'number' && Number.isFinite(width) ? width : fallback
  return Math.min(MAX_IMAGE_WIDTH, Math.max(MIN_IMAGE_WIDTH, Math.round(candidate)))
}

export function normalizeApodImageQuality(quality: number | undefined, fallback: number): number {
  const candidate = typeof quality === 'number' && Number.isFinite(quality) ? quality : fallback
  return Math.min(MAX_IMAGE_QUALITY, Math.max(MIN_IMAGE_QUALITY, Math.round(candidate)))
}

async function fetchSourceImageBuffer(sourceUrl: string): Promise<Buffer> {
  const response = await fetch(sourceUrl)
  if (!response.ok) {
    throw new Error(`NASA APOD image responded with ${response.status}`)
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.startsWith('image/')) {
    throw new Error('APOD asset is not an image')
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function getOptimizedApodImage(
  sourceUrl: string,
  width: number,
  quality: number,
): Promise<OptimizedApodImageAsset> {
  const normalizedSourceUrl = normalizeApodImageUrl(sourceUrl)
  if (!normalizedSourceUrl) {
    throw new Error('Unsupported APOD image source')
  }

  const normalizedWidth = normalizeApodImageWidth(width, width)
  const normalizedQuality = normalizeApodImageQuality(quality, quality)
  const cacheKey = getCacheKey(normalizedSourceUrl, normalizedWidth, normalizedQuality)

  const cached = getCachedImage(cacheKey)
  if (cached) {
    return cached
  }

  const existing = inflightOptimizations.get(cacheKey)
  if (existing) {
    return existing
  }

  const optimization = (async () => {
    logger.info('Optimizing APOD image asset', {
      sourceUrl: normalizedSourceUrl,
      width: normalizedWidth,
      quality: normalizedQuality,
    })

    const sourceBuffer = await fetchSourceImageBuffer(normalizedSourceUrl)
    const optimizedBuffer = await sharp(sourceBuffer)
      .rotate()
      .resize({
        width: normalizedWidth,
        withoutEnlargement: true,
      })
      .webp({ quality: normalizedQuality })
      .toBuffer()

    const asset: OptimizedApodImageAsset = {
      buffer: optimizedBuffer,
      contentType: 'image/webp',
      etag: createHash('sha1').update(optimizedBuffer).digest('hex'),
    }

    setCachedImage(cacheKey, asset)
    return asset
  })()

  inflightOptimizations.set(cacheKey, optimization)
  const cleanup = () => inflightOptimizations.delete(cacheKey)
  optimization.then(cleanup, cleanup)

  return optimization
}
