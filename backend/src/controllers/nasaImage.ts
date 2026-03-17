import type { Request, Response, NextFunction } from 'express'
import { sendApiError } from '../lib/apiErrors'
import { searchNasaImages } from '../services/nasaImage'

export async function searchImages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { q, media_type, year_start, year_end, page } = req.query

    if (typeof q !== 'string' || q.trim().length === 0) {
      sendApiError(res, 400, 'missing_query', 'Search query (q) is required.')
      return
    }

    if (q.trim().length > 200) {
      sendApiError(res, 400, 'query_too_long', 'Search query must be under 200 characters.')
      return
    }

    const query: {
      q: string
      media_type?: string
      year_start?: string
      year_end?: string
      page?: number
    } = { q: q.trim() }

    if (typeof media_type === 'string') {
      const valid = ['image', 'video', 'audio']
      if (!valid.includes(media_type)) {
        sendApiError(
          res,
          400,
          'invalid_media_type',
          `media_type must be one of: ${valid.join(', ')}.`,
        )
        return
      }
      query.media_type = media_type
    }

    if (typeof year_start === 'string') {
      const parsed = /^\d{4}$/.test(year_start) ? Number(year_start) : NaN
      if (!(parsed >= 1920 && parsed <= new Date().getFullYear())) {
        sendApiError(res, 400, 'invalid_year_start', 'year_start must be a valid four-digit year.')
        return
      }
      query.year_start = year_start
    }

    if (typeof year_end === 'string') {
      const parsed = /^\d{4}$/.test(year_end) ? Number(year_end) : NaN
      if (!(parsed >= 1920 && parsed <= new Date().getFullYear())) {
        sendApiError(res, 400, 'invalid_year_end', 'year_end must be a valid four-digit year.')
        return
      }
      query.year_end = year_end
    }

    if (query.year_start && query.year_end && query.year_start > query.year_end) {
      sendApiError(res, 400, 'invalid_year_range', 'year_start cannot be later than year_end.')
      return
    }

    if (typeof page === 'string') {
      const parsed = /^\d+$/.test(page) ? Number(page) : NaN
      if (!(parsed >= 1)) {
        sendApiError(res, 400, 'invalid_page', 'page must be a positive integer.')
        return
      }
      query.page = parsed
    }

    const data = await searchNasaImages(query)
    res.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (message.includes('NASA Image Library')) {
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
