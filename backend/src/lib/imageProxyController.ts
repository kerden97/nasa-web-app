import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import { sendApiError } from './apiErrors'
import { getRequestBaseUrl } from './requestUrl'
import { sendZodQueryError } from './queryValidation'

export const imageProxyQuerySchema = z.object({
  src: z.string().url(),
  w: z.coerce.number().optional(),
  q: z.coerce.number().optional(),
})

interface OptimizedImageAsset {
  buffer: Buffer
  contentType: string
  etag: string
}

interface BuildImageProxyUrlOptions {
  routePath: string
  sourceUrl: string | undefined
  width: number
  quality: number
  isOptimizableSource: (sourceUrl: string | undefined) => sourceUrl is string
}

interface CreateImageProxyHandlerOptions {
  defaultWidth: number
  defaultQuality: number
  normalizeWidth: (width: number | undefined, fallback: number) => number
  normalizeQuality: (quality: number | undefined, fallback: number) => number
  getOptimizedImage: (
    sourceUrl: string,
    width: number,
    quality: number,
  ) => Promise<OptimizedImageAsset>
  unsupportedSourceError: string
  unsupportedSourceMessage: string
  upstreamUnavailableMessage: string
}

function isRemoteImageUnavailableError(message: string): boolean {
  return (
    message.startsWith('Remote image responded with') || message === 'Remote asset is not an image'
  )
}

function sendOptimizedImageResponse(res: Response, asset: OptimizedImageAsset): void {
  res.setHeader('Content-Type', asset.contentType)
  res.setHeader('Content-Length', String(asset.buffer.length))
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  res.setHeader('ETag', asset.etag)
  res.end(asset.buffer)
}

export function buildImageProxyUrl(
  req: Request,
  options: BuildImageProxyUrlOptions,
): string | undefined {
  if (!options.isOptimizableSource(options.sourceUrl)) return undefined

  const url = new URL(options.routePath, getRequestBaseUrl(req))
  url.searchParams.set('src', options.sourceUrl)
  url.searchParams.set('w', String(options.width))
  url.searchParams.set('q', String(options.quality))
  return url.toString()
}

export function createImageProxyHandler(options: CreateImageProxyHandlerOptions) {
  return async function imageProxyHandler(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const parsedQuery = imageProxyQuerySchema.safeParse(req.query)
      if (!parsedQuery.success) {
        sendZodQueryError(res, sendApiError, parsedQuery.error)
        return
      }

      const width = options.normalizeWidth(parsedQuery.data.w, options.defaultWidth)
      const quality = options.normalizeQuality(parsedQuery.data.q, options.defaultQuality)
      const optimized = await options.getOptimizedImage(parsedQuery.data.src, width, quality)

      if (req.get('if-none-match') === optimized.etag) {
        res.status(304).end()
        return
      }

      sendOptimizedImageResponse(res, optimized)
    } catch (error) {
      const message = error instanceof Error ? error.message : ''

      if (message === options.unsupportedSourceError) {
        sendApiError(res, 400, 'unsupported_image_source', options.unsupportedSourceMessage)
        return
      }

      if (isRemoteImageUnavailableError(message)) {
        sendApiError(res, 502, 'upstream_image_unavailable', options.upstreamUnavailableMessage)
        return
      }

      next(error)
    }
  }
}
