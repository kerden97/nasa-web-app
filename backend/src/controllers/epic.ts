import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { sendApiError } from '../lib/apiErrors'
import { dateField, sendZodQueryError } from '../lib/queryValidation'
import { fetchEpicImages, fetchEpicDates } from '../services/epic'
import {
  getOptimizedEpicImage,
  isOptimizableEpicImageSource,
  normalizeEpicImageQuality,
  normalizeEpicImageWidth,
} from '../services/epicImageProxy'
import type { EpicCollection } from '../types/epic'
import type { EpicImage } from '../types/epic'

const VALID_COLLECTIONS = ['natural', 'enhanced'] as const
const epicCollectionSchema = z.preprocess(
  (value) =>
    typeof value === 'string' && VALID_COLLECTIONS.includes(value as EpicCollection)
      ? value
      : 'natural',
  z.enum(VALID_COLLECTIONS),
)

const epicImagesQuerySchema = z.object({
  collection: epicCollectionSchema,
  date: dateField('invalid_date', 'Invalid date format. Use YYYY-MM-DD.'),
})

const epicDatesQuerySchema = z.object({
  collection: epicCollectionSchema,
})

const epicImageProxyQuerySchema = z.object({
  src: z.string().url(),
  w: z.coerce.number().optional(),
  q: z.coerce.number().optional(),
})

const EPIC_CARD_WIDTH = 640
const EPIC_CARD_QUALITY = 70

function getRequestBaseUrl(req: Request): string {
  const forwardedProto = req.get('x-forwarded-proto')?.split(',')[0]?.trim()
  const forwardedHost = req.get('x-forwarded-host')
  const protocol = forwardedProto || req.protocol || 'http'
  const host = forwardedHost || req.get('host')

  return `${protocol}://${host}`
}

function buildEpicImageProxyUrl(
  req: Request,
  sourceUrl: string | undefined,
  width: number,
  quality: number,
): string | undefined {
  if (!isOptimizableEpicImageSource(sourceUrl)) return undefined

  const url = new URL('/api/epic/image', getRequestBaseUrl(req))
  url.searchParams.set('src', sourceUrl)
  url.searchParams.set('w', String(width))
  url.searchParams.set('q', String(quality))
  return url.toString()
}

function decorateEpicImage(req: Request, item: EpicImage): EpicImage {
  const cardUrl = buildEpicImageProxyUrl(req, item.image, EPIC_CARD_WIDTH, EPIC_CARD_QUALITY)

  return {
    ...item,
    ...(cardUrl ? { card_url: cardUrl } : {}),
  }
}

export async function getEpicImages(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsedQuery = epicImagesQuerySchema.safeParse(req.query)

    if (!parsedQuery.success) {
      sendZodQueryError(res, sendApiError, parsedQuery.error)
      return
    }

    const { collection, date } = parsedQuery.data
    const data = await fetchEpicImages(collection as EpicCollection, date)
    res.json(data.map((item) => decorateEpicImage(req, item)))
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (message.includes('NASA EPIC')) {
      sendApiError(
        res,
        502,
        'upstream_service_unavailable',
        "NASA's EPIC API is temporarily unavailable. Please try again shortly.",
      )
      return
    }
    next(error)
  }
}

export async function getEpicDates(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsedQuery = epicDatesQuerySchema.safeParse(req.query)

    if (!parsedQuery.success) {
      sendZodQueryError(res, sendApiError, parsedQuery.error)
      return
    }

    const data = await fetchEpicDates(parsedQuery.data.collection as EpicCollection)
    res.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (message.includes('NASA EPIC')) {
      sendApiError(
        res,
        502,
        'upstream_service_unavailable',
        "NASA's EPIC API is temporarily unavailable. Please try again shortly.",
      )
      return
    }
    next(error)
  }
}

export async function getEpicImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsedQuery = epicImageProxyQuerySchema.safeParse(req.query)
    if (!parsedQuery.success) {
      sendZodQueryError(res, sendApiError, parsedQuery.error)
      return
    }

    const width = normalizeEpicImageWidth(parsedQuery.data.w, EPIC_CARD_WIDTH)
    const quality = normalizeEpicImageQuality(parsedQuery.data.q, EPIC_CARD_QUALITY)
    const optimized = await getOptimizedEpicImage(parsedQuery.data.src, width, quality)

    if (req.get('if-none-match') === optimized.etag) {
      res.status(304).end()
      return
    }

    res.setHeader('Content-Type', optimized.contentType)
    res.setHeader('Content-Length', String(optimized.buffer.length))
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    res.setHeader('ETag', optimized.etag)
    res.end(optimized.buffer)
  } catch (error) {
    const message = error instanceof Error ? error.message : ''

    if (message === 'Unsupported EPIC image source') {
      sendApiError(
        res,
        400,
        'unsupported_image_source',
        'Only EPIC-hosted image assets can be optimized.',
      )
      return
    }

    if (
      message.startsWith('Remote image responded with') ||
      message === 'Remote asset is not an image'
    ) {
      sendApiError(
        res,
        502,
        'upstream_image_unavailable',
        "NASA's EPIC image asset is temporarily unavailable. Please try again shortly.",
      )
      return
    }

    next(error)
  }
}
