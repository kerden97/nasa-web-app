import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { sendApiError } from '../lib/apiErrors'
import { sendZodQueryError } from '../lib/queryValidation'
import { isUpstreamServiceError } from '../lib/upstreamService'
import {
  getOptimizedNasaImage,
  isOptimizableNasaImageSource,
  normalizeNasaImageQuality,
  normalizeNasaImageWidth,
} from '../services/nasaImageProxy'
import { searchNasaImages } from '../services/nasaImage'
import { imageProxyDefaults } from '../config/imageProxy'
import { buildImageProxyUrl, createImageProxyHandler } from '../lib/imageProxyController'
import type { NasaImageItem } from '../types/nasaImage'
import type { NasaImageQuery } from '../types/nasaImage'

const VALID_MEDIA_TYPES = ['image', 'video', 'audio'] as const
const CURRENT_YEAR = new Date().getFullYear()

const searchQueryField = z
  .preprocess(
    (value) => (typeof value === 'string' ? value.trim() : undefined),
    z
      .string()
      .optional()
      .superRefine((value, ctx) => {
        if (!value) {
          ctx.addIssue({
            code: 'custom',
            message: 'Search query (q) is required.',
            params: { apiCode: 'missing_query' },
          })
          return
        }

        if (value.length > 200) {
          ctx.addIssue({
            code: 'custom',
            message: 'Search query must be under 200 characters.',
            params: { apiCode: 'query_too_long' },
          })
        }
      }),
  )
  .transform((value) => value as string)

const mediaTypeField = z.preprocess(
  (value) => (typeof value === 'string' ? value : undefined),
  z
    .string()
    .optional()
    .superRefine((value, ctx) => {
      if (value === undefined) return

      if (!VALID_MEDIA_TYPES.includes(value as (typeof VALID_MEDIA_TYPES)[number])) {
        ctx.addIssue({
          code: 'custom',
          message: `media_type must be one of: ${VALID_MEDIA_TYPES.join(', ')}.`,
          params: { apiCode: 'invalid_media_type' },
        })
      }
    }),
)

function yearField(errorCode: string, fieldName: string) {
  return z.preprocess(
    (value) => (typeof value === 'string' ? value : undefined),
    z
      .string()
      .optional()
      .superRefine((value, ctx) => {
        if (value === undefined) return

        const parsed = /^\d{4}$/.test(value) ? Number(value) : NaN
        if (!(parsed >= 1920 && parsed <= CURRENT_YEAR)) {
          ctx.addIssue({
            code: 'custom',
            message: `${fieldName} must be a valid four-digit year.`,
            params: { apiCode: errorCode },
          })
        }
      }),
  )
}

const pageField = z.preprocess(
  (value) => (typeof value === 'string' ? value : undefined),
  z
    .string()
    .optional()
    .superRefine((value, ctx) => {
      if (value === undefined) return

      const parsed = /^\d+$/.test(value) ? Number(value) : NaN
      if (!(parsed >= 1)) {
        ctx.addIssue({
          code: 'custom',
          message: 'page must be a positive integer.',
          params: { apiCode: 'invalid_page' },
        })
      }
    }),
)

const nasaImageQuerySchema = z
  .object({
    q: searchQueryField,
    media_type: mediaTypeField,
    year_start: yearField('invalid_year_start', 'year_start'),
    year_end: yearField('invalid_year_end', 'year_end'),
    page: pageField,
  })
  .superRefine((query, ctx) => {
    if (query.year_start && query.year_end && query.year_start > query.year_end) {
      ctx.addIssue({
        code: 'custom',
        path: ['year_start'],
        message: 'year_start cannot be later than year_end.',
        params: { apiCode: 'invalid_year_range' },
      })
    }
  })
  .transform(
    ({ q, media_type, year_start, year_end, page }): NasaImageQuery => ({
      q,
      ...(media_type === undefined ? {} : { media_type }),
      ...(year_start === undefined ? {} : { year_start }),
      ...(year_end === undefined ? {} : { year_end }),
      ...(page === undefined ? {} : { page: Number(page) }),
    }),
  )

const { cardWidth: NASA_IMAGE_CARD_WIDTH, cardQuality: NASA_IMAGE_CARD_QUALITY } =
  imageProxyDefaults.nasaImage
const NASA_IMAGE_PROXY_ROUTE = '/api/nasa-image/image'

function buildNasaImageProxyUrl(
  req: Request,
  sourceUrl: string | undefined,
  width: number,
  quality: number,
): string | undefined {
  return buildImageProxyUrl(req, {
    routePath: NASA_IMAGE_PROXY_ROUTE,
    sourceUrl,
    width,
    quality,
    isOptimizableSource: isOptimizableNasaImageSource,
  })
}

function decorateNasaImageItem(req: Request, item: NasaImageItem): NasaImageItem {
  const cardUrl = buildNasaImageProxyUrl(
    req,
    item.href,
    NASA_IMAGE_CARD_WIDTH,
    NASA_IMAGE_CARD_QUALITY,
  )

  return {
    ...item,
    ...(cardUrl ? { card_url: cardUrl } : {}),
  }
}

export async function searchImages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsedQuery = nasaImageQuerySchema.safeParse(req.query)

    if (!parsedQuery.success) {
      sendZodQueryError(res, sendApiError, parsedQuery.error)
      return
    }

    const data = await searchNasaImages(parsedQuery.data)
    res.json({
      ...data,
      items: data.items.map((item) => decorateNasaImageItem(req, item)),
    })
  } catch (error) {
    if (isUpstreamServiceError(error, 'NASA Image Library')) {
      sendApiError(
        res,
        502,
        'upstream_service_unavailable',
        "NASA's Image Library is temporarily unavailable. Please try again shortly.",
      )
      return
    }
    next(error)
  }
}

export const getNasaImage = createImageProxyHandler({
  defaultWidth: NASA_IMAGE_CARD_WIDTH,
  defaultQuality: NASA_IMAGE_CARD_QUALITY,
  normalizeWidth: normalizeNasaImageWidth,
  normalizeQuality: normalizeNasaImageQuality,
  getOptimizedImage: getOptimizedNasaImage,
  unsupportedSourceError: 'Unsupported NASA Image Library image source',
  unsupportedSourceMessage: 'Only NASA Image Library preview assets can be optimized.',
  upstreamUnavailableMessage:
    "NASA's Image Library preview asset is temporarily unavailable. Please try again shortly.",
})
