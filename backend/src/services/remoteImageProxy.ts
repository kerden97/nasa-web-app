import { createHash } from 'crypto'
import type sharp from 'sharp'
import logger from '../lib/logger'

const MIN_IMAGE_WIDTH = 240
const MAX_IMAGE_WIDTH = 1600
const MIN_IMAGE_QUALITY = 40
const MAX_IMAGE_QUALITY = 90
const MEMORY_CACHE_TTL_MS = 24 * 60 * 60 * 1000
const MAX_MEMORY_CACHE_ENTRIES = 128

export interface RemoteImageProxyPolicy {
  label: string
  allowedHosts: ReadonlySet<string>
  pathPrefixes?: readonly string[]
}

export interface OptimizedRemoteImageAsset {
  buffer: Buffer
  contentType: string
  etag: string
}

interface CachedRemoteImageAsset extends OptimizedRemoteImageAsset {
  expiresAt: number
  cachedAt: number
}

const remoteImageMemoryCache = new Map<string, CachedRemoteImageAsset>()
const inflightOptimizations = new Map<string, Promise<OptimizedRemoteImageAsset>>()
type SharpFactory = typeof sharp

let sharpLoader: Promise<SharpFactory> | null = null

export function createRemoteImageProxyPolicy(
  label: string,
  allowedHosts: string[],
  pathPrefixes?: string[],
): RemoteImageProxyPolicy {
  return {
    label,
    allowedHosts: new Set(allowedHosts),
    ...(pathPrefixes ? { pathPrefixes } : {}),
  }
}

function getCacheKey(sourceUrl: string, width: number, quality: number): string {
  return `${sourceUrl}|w=${width}|q=${quality}`
}

function getCachedImage(cacheKey: string): OptimizedRemoteImageAsset | null {
  const cached = remoteImageMemoryCache.get(cacheKey)
  if (!cached) return null

  if (cached.expiresAt <= Date.now()) {
    remoteImageMemoryCache.delete(cacheKey)
    return null
  }

  return {
    buffer: cached.buffer,
    contentType: cached.contentType,
    etag: cached.etag,
  }
}

function setCachedImage(cacheKey: string, asset: OptimizedRemoteImageAsset): void {
  remoteImageMemoryCache.set(cacheKey, {
    ...asset,
    cachedAt: Date.now(),
    expiresAt: Date.now() + MEMORY_CACHE_TTL_MS,
  })

  if (remoteImageMemoryCache.size <= MAX_MEMORY_CACHE_ENTRIES) return

  const oldestEntry = [...remoteImageMemoryCache.entries()].reduce((oldest, current) =>
    current[1].cachedAt < oldest[1].cachedAt ? current : oldest,
  )
  remoteImageMemoryCache.delete(oldestEntry[0])
}

function normalizeImageUrl(sourceUrl: string, policy: RemoteImageProxyPolicy): string | null {
  try {
    const parsed = new URL(sourceUrl)
    if (parsed.protocol !== 'https:') return null
    if (!policy.allowedHosts.has(parsed.hostname)) return null
    if (policy.pathPrefixes?.length) {
      const matchesPrefix = policy.pathPrefixes.some((prefix) => parsed.pathname.startsWith(prefix))
      if (!matchesPrefix) return null
    }
    return parsed.toString()
  } catch {
    return null
  }
}

export function isOptimizableRemoteImageSource(
  sourceUrl: string | undefined,
  policy: RemoteImageProxyPolicy,
): sourceUrl is string {
  return typeof sourceUrl === 'string' && normalizeImageUrl(sourceUrl, policy) !== null
}

export function normalizeOptimizedImageWidth(width: number | undefined, fallback: number): number {
  const candidate = typeof width === 'number' && Number.isFinite(width) ? width : fallback
  return Math.min(MAX_IMAGE_WIDTH, Math.max(MIN_IMAGE_WIDTH, Math.round(candidate)))
}

export function normalizeOptimizedImageQuality(
  quality: number | undefined,
  fallback: number,
): number {
  const candidate = typeof quality === 'number' && Number.isFinite(quality) ? quality : fallback
  return Math.min(MAX_IMAGE_QUALITY, Math.max(MIN_IMAGE_QUALITY, Math.round(candidate)))
}

async function getSharp(): Promise<SharpFactory> {
  if (!sharpLoader) {
    sharpLoader = import('sharp')
      .then((module) => module.default)
      .catch((error) => {
        sharpLoader = null
        throw error
      })
  }

  return sharpLoader
}

async function fetchSourceImageBuffer(sourceUrl: string): Promise<Buffer> {
  const response = await fetch(sourceUrl)
  if (!response.ok) {
    throw new Error(`Remote image responded with ${response.status}`)
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.startsWith('image/')) {
    throw new Error('Remote asset is not an image')
  }

  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

export async function getOptimizedRemoteImage(
  sourceUrl: string,
  width: number,
  quality: number,
  policy: RemoteImageProxyPolicy,
): Promise<OptimizedRemoteImageAsset> {
  const normalizedSourceUrl = normalizeImageUrl(sourceUrl, policy)
  if (!normalizedSourceUrl) {
    throw new Error(`Unsupported ${policy.label} image source`)
  }

  const normalizedWidth = normalizeOptimizedImageWidth(width, width)
  const normalizedQuality = normalizeOptimizedImageQuality(quality, quality)
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
    logger.info(`Optimizing ${policy.label} image asset`, {
      sourceUrl: normalizedSourceUrl,
      width: normalizedWidth,
      quality: normalizedQuality,
    })

    const sourceBuffer = await fetchSourceImageBuffer(normalizedSourceUrl)
    const sharp = await getSharp()
    const optimizedBuffer = await sharp(sourceBuffer)
      .rotate()
      .resize({
        width: normalizedWidth,
        withoutEnlargement: true,
      })
      .webp({ quality: normalizedQuality })
      .toBuffer()

    const asset: OptimizedRemoteImageAsset = {
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
