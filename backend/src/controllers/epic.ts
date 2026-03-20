import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { sendApiError } from '../lib/apiErrors'
import { dateField, sendZodQueryError } from '../lib/queryValidation'
import { isUpstreamServiceError } from '../lib/upstreamService'
import { fetchEpicImages, fetchEpicDates } from '../services/epic'
import {
  getOptimizedEpicImage,
  isOptimizableEpicImageSource,
  normalizeEpicImageQuality,
  normalizeEpicImageWidth,
} from '../services/epicImageProxy'
import { imageProxyDefaults } from '../config/imageProxy'
import { buildImageProxyUrl, createImageProxyHandler } from '../lib/imageProxyController'
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

const { cardWidth: EPIC_CARD_WIDTH, cardQuality: EPIC_CARD_QUALITY } = imageProxyDefaults.epic
const EPIC_IMAGE_PROXY_ROUTE = '/api/epic/image'

function buildEpicImageProxyUrl(
  req: Request,
  sourceUrl: string | undefined,
  width: number,
  quality: number,
): string | undefined {
  return buildImageProxyUrl(req, {
    routePath: EPIC_IMAGE_PROXY_ROUTE,
    sourceUrl,
    width,
    quality,
    isOptimizableSource: isOptimizableEpicImageSource,
  })
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
    if (isUpstreamServiceError(error, 'NASA EPIC')) {
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
    if (isUpstreamServiceError(error, 'NASA EPIC')) {
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

export const getEpicImage = createImageProxyHandler({
  defaultWidth: EPIC_CARD_WIDTH,
  defaultQuality: EPIC_CARD_QUALITY,
  normalizeWidth: normalizeEpicImageWidth,
  normalizeQuality: normalizeEpicImageQuality,
  getOptimizedImage: getOptimizedEpicImage,
  unsupportedSourceError: 'Unsupported EPIC image source',
  unsupportedSourceMessage: 'Only EPIC-hosted image assets can be optimized.',
  upstreamUnavailableMessage:
    "NASA's EPIC image asset is temporarily unavailable. Please try again shortly.",
})
