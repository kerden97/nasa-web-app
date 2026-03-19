import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { sendApiError } from '../lib/apiErrors'
import { isUpstreamServiceError } from '../lib/upstreamService'
import { fetchApod } from '../services/apod'
import {
  getOptimizedApodImage,
  isOptimizableApodImageSource,
  normalizeApodImageQuality,
  normalizeApodImageWidth,
} from '../services/apodImageProxy'
import type { ApodQuery } from '../types/apod'
import type { ApodItem } from '../types/apod'
import { isValidDate } from '../lib/validation'

function dateField(errorCode: string, fieldName: string) {
  return z.preprocess(
    (value) => (typeof value === 'string' ? value : undefined),
    z
      .string()
      .optional()
      .superRefine((value, ctx) => {
        if (value !== undefined && !isValidDate(value)) {
          ctx.addIssue({
            code: 'custom',
            message: `Invalid ${fieldName} format. Use YYYY-MM-DD.`,
            params: { apiCode: errorCode },
          })
        }
      }),
  )
}

const countField = z.preprocess(
  (value) => (typeof value === 'string' ? value : undefined),
  z
    .string()
    .optional()
    .superRefine((value, ctx) => {
      if (value === undefined) return

      const parsed = /^\d+$/.test(value) ? Number(value) : NaN
      if (!(parsed >= 1 && parsed <= 100)) {
        ctx.addIssue({
          code: 'custom',
          message: 'count must be between 1 and 100.',
          params: { apiCode: 'invalid_count' },
        })
      }
    }),
)

const apodQuerySchema = z
  .object({
    date: dateField('invalid_date', 'date'),
    start_date: dateField('invalid_start_date', 'start_date'),
    end_date: dateField('invalid_end_date', 'end_date'),
    count: countField,
  })
  .superRefine((query, ctx) => {
    if (query.date && (query.start_date || query.end_date || query.count)) {
      ctx.addIssue({
        code: 'custom',
        path: ['date'],
        message: 'date cannot be combined with start_date, end_date, or count.',
        params: { apiCode: 'invalid_query_combination' },
      })
    }

    if (query.start_date && query.end_date && query.start_date > query.end_date) {
      ctx.addIssue({
        code: 'custom',
        path: ['start_date'],
        message: 'start_date cannot be later than end_date.',
        params: { apiCode: 'invalid_date_range' },
      })
    }
  })
  .transform(
    ({ date, start_date, end_date, count }): ApodQuery => ({
      ...(date === undefined ? {} : { date }),
      ...(start_date === undefined ? {} : { start_date }),
      ...(end_date === undefined ? {} : { end_date }),
      ...(count === undefined ? {} : { count: Number(count) }),
    }),
  )

const apodImageProxyQuerySchema = z.object({
  src: z.string().url(),
  w: z.coerce.number().optional(),
  q: z.coerce.number().optional(),
})

const APOD_HERO_WIDTH = 1280
const APOD_HERO_QUALITY = 78
const APOD_CARD_WIDTH = 640
const APOD_CARD_QUALITY = 68

function sendValidationError(res: Response, error: z.ZodError): void {
  const [issue] = error.issues
  const apiCode =
    issue &&
    issue.code === 'custom' &&
    'params' in issue &&
    issue.params &&
    typeof issue.params.apiCode === 'string'
      ? issue.params.apiCode
      : 'invalid_query'

  sendApiError(res, 400, apiCode, issue?.message ?? 'Invalid query parameters.')
}

function getRequestBaseUrl(req: Request): string {
  const forwardedProto = req.get('x-forwarded-proto')?.split(',')[0]?.trim()
  const forwardedHost = req.get('x-forwarded-host')
  const protocol = forwardedProto || req.protocol || 'http'
  const host = forwardedHost || req.get('host')

  return `${protocol}://${host}`
}

function buildApodImageProxyUrl(
  req: Request,
  sourceUrl: string | undefined,
  width: number,
  quality: number,
): string | undefined {
  if (!isOptimizableApodImageSource(sourceUrl)) return undefined

  const url = new URL('/api/apod/image', getRequestBaseUrl(req))
  url.searchParams.set('src', sourceUrl)
  url.searchParams.set('w', String(width))
  url.searchParams.set('q', String(quality))
  return url.toString()
}

function decorateApodItem(req: Request, item: ApodItem): ApodItem {
  if (item.media_type !== 'image') return item

  const heroUrl = buildApodImageProxyUrl(req, item.url, APOD_HERO_WIDTH, APOD_HERO_QUALITY)
  const cardUrl = buildApodImageProxyUrl(req, item.url, APOD_CARD_WIDTH, APOD_CARD_QUALITY)

  return {
    ...item,
    ...(heroUrl ? { hero_url: heroUrl } : {}),
    ...(cardUrl ? { card_url: cardUrl } : {}),
  }
}

function decorateApodResponse(req: Request, data: ApodItem | ApodItem[]): ApodItem | ApodItem[] {
  return Array.isArray(data)
    ? data.map((item) => decorateApodItem(req, item))
    : decorateApodItem(req, data)
}

export async function getApod(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsedQuery = apodQuerySchema.safeParse(req.query)

    if (!parsedQuery.success) {
      sendValidationError(res, parsedQuery.error)
      return
    }

    const data = await fetchApod(parsedQuery.data)
    res.json(decorateApodResponse(req, data))
  } catch (error) {
    if (isUpstreamServiceError(error, 'NASA API')) {
      sendApiError(
        res,
        502,
        'upstream_service_unavailable',
        "NASA's API is temporarily unavailable for this date. Please try again shortly.",
      )
      return
    }
    next(error)
  }
}

export async function getApodImage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsedQuery = apodImageProxyQuerySchema.safeParse(req.query)
    if (!parsedQuery.success) {
      sendValidationError(res, parsedQuery.error)
      return
    }

    const width = normalizeApodImageWidth(parsedQuery.data.w, APOD_HERO_WIDTH)
    const quality = normalizeApodImageQuality(parsedQuery.data.q, APOD_HERO_QUALITY)
    const optimized = await getOptimizedApodImage(parsedQuery.data.src, width, quality)

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

    if (message === 'Unsupported APOD image source') {
      sendApiError(
        res,
        400,
        'unsupported_image_source',
        'Only APOD-hosted image assets can be optimized.',
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
        "NASA's APOD image asset is temporarily unavailable. Please try again shortly.",
      )
      return
    }

    next(error)
  }
}
