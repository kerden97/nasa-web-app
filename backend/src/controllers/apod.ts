import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { sendApiError } from '../lib/apiErrors'
import { dateField, sendZodQueryError } from '../lib/queryValidation'
import { isUpstreamServiceError } from '../lib/upstreamService'
import { fetchApod } from '../services/apod'
import {
  getOptimizedApodImage,
  isOptimizableApodImageSource,
  normalizeApodImageQuality,
  normalizeApodImageWidth,
} from '../services/apodImageProxy'
import { imageProxyDefaults } from '../config/imageProxy'
import { buildImageProxyUrl, createImageProxyHandler } from '../lib/imageProxyController'
import type { ApodQuery } from '../types/apod'
import type { ApodItem } from '../types/apod'

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
    date: dateField('invalid_date', 'Invalid date format. Use YYYY-MM-DD.'),
    start_date: dateField('invalid_start_date', 'Invalid start_date format. Use YYYY-MM-DD.'),
    end_date: dateField('invalid_end_date', 'Invalid end_date format. Use YYYY-MM-DD.'),
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

const {
  heroWidth: APOD_HERO_WIDTH,
  heroQuality: APOD_HERO_QUALITY,
  cardWidth: APOD_CARD_WIDTH,
  cardQuality: APOD_CARD_QUALITY,
} = imageProxyDefaults.apod
const APOD_IMAGE_PROXY_ROUTE = '/api/apod/image'

function buildApodImageProxyUrl(
  req: Request,
  sourceUrl: string | undefined,
  width: number,
  quality: number,
): string | undefined {
  return buildImageProxyUrl(req, {
    routePath: APOD_IMAGE_PROXY_ROUTE,
    sourceUrl,
    width,
    quality,
    isOptimizableSource: isOptimizableApodImageSource,
  })
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
      sendZodQueryError(res, sendApiError, parsedQuery.error)
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

export const getApodImage = createImageProxyHandler({
  defaultWidth: APOD_HERO_WIDTH,
  defaultQuality: APOD_HERO_QUALITY,
  normalizeWidth: normalizeApodImageWidth,
  normalizeQuality: normalizeApodImageQuality,
  getOptimizedImage: getOptimizedApodImage,
  unsupportedSourceError: 'Unsupported APOD image source',
  unsupportedSourceMessage: 'Only APOD-hosted image assets can be optimized.',
  upstreamUnavailableMessage:
    "NASA's APOD image asset is temporarily unavailable. Please try again shortly.",
})
