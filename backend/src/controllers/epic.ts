import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { sendApiError } from '../lib/apiErrors'
import { dateField, sendZodQueryError } from '../lib/queryValidation'
import { fetchEpicImages, fetchEpicDates } from '../services/epic'
import type { EpicCollection } from '../types/epic'

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
