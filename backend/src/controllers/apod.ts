import type { Request, Response, NextFunction } from 'express'
import { sendApiError } from '../lib/apiErrors'
import { fetchApod } from '../services/apod'
import type { ApodQuery } from '../types/apod'
import { isValidDate } from '../lib/validation'

export async function getApod(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { date, start_date, end_date, count } = req.query

    const query: ApodQuery = {}

    if (typeof date === 'string') {
      if (!isValidDate(date)) {
        sendApiError(res, 400, 'invalid_date', 'Invalid date format. Use YYYY-MM-DD.')
        return
      }
      query.date = date
    }

    if (typeof start_date === 'string') {
      if (!isValidDate(start_date)) {
        sendApiError(res, 400, 'invalid_start_date', 'Invalid start_date format. Use YYYY-MM-DD.')
        return
      }
      query.start_date = start_date
    }

    if (typeof end_date === 'string') {
      if (!isValidDate(end_date)) {
        sendApiError(res, 400, 'invalid_end_date', 'Invalid end_date format. Use YYYY-MM-DD.')
        return
      }
      query.end_date = end_date
    }

    if (typeof count === 'string') {
      const parsed = /^\d+$/.test(count) ? Number(count) : NaN
      if (!(parsed >= 1 && parsed <= 100)) {
        sendApiError(res, 400, 'invalid_count', 'count must be between 1 and 100.')
        return
      }
      query.count = parsed
    }

    if (query.date && (query.start_date || query.end_date || query.count)) {
      sendApiError(
        res,
        400,
        'invalid_query_combination',
        'date cannot be combined with start_date, end_date, or count.',
      )
      return
    }

    if (query.start_date && query.end_date && query.start_date > query.end_date) {
      sendApiError(res, 400, 'invalid_date_range', 'start_date cannot be later than end_date.')
      return
    }

    const data = await fetchApod(query)
    res.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (message.includes('NASA API')) {
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
