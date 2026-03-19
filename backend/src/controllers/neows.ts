import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { sendApiError } from '../lib/apiErrors'
import { requiredDateField, sendZodQueryError, toUtcDate } from '../lib/queryValidation'
import { fetchNeoFeed } from '../services/neows'
import { isValidDate } from '../lib/validation'

const neoFeedQuerySchema = z
  .object({
    start_date: requiredDateField(
      'invalid_start_date',
      'Invalid or missing start_date. Use YYYY-MM-DD.',
    ),
    end_date: requiredDateField('invalid_end_date', 'Invalid or missing end_date. Use YYYY-MM-DD.'),
  })
  .superRefine((query, ctx) => {
    if (!isValidDate(query.start_date) || !isValidDate(query.end_date)) return

    const start = toUtcDate(query.start_date)
    const end = toUtcDate(query.end_date)
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)

    if (diffDays < 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['start_date'],
        message: 'start_date must be before or equal to end_date.',
        params: { apiCode: 'invalid_date_range' },
      })
    }

    if (diffDays > 6) {
      ctx.addIssue({
        code: 'custom',
        path: ['end_date'],
        message: 'Date range cannot exceed 7 days.',
        params: { apiCode: 'invalid_date_range' },
      })
    }
  })

export async function getNeoFeed(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsedQuery = neoFeedQuerySchema.safeParse(req.query)

    if (!parsedQuery.success) {
      sendZodQueryError(res, sendApiError, parsedQuery.error)
      return
    }

    const { start_date, end_date } = parsedQuery.data
    const data = await fetchNeoFeed(start_date, end_date)
    res.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (message.includes('NASA NeoWs')) {
      sendApiError(
        res,
        502,
        'upstream_service_unavailable',
        "NASA's NeoWs API is temporarily unavailable. Please try again shortly.",
      )
      return
    }
    next(error)
  }
}
