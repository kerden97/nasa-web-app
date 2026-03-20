import type { Request, Response, NextFunction } from 'express'
import { sendApiError } from '../lib/apiErrors'
import { neoDateRangeQuerySchema, sendZodQueryError } from '../lib/queryValidation'
import { fetchNeoFeed } from '../services/neows'
import { isUpstreamServiceError } from '../lib/upstreamService'

export async function getNeoFeed(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsedQuery = neoDateRangeQuerySchema.safeParse(req.query)

    if (!parsedQuery.success) {
      sendZodQueryError(res, sendApiError, parsedQuery.error)
      return
    }

    const { start_date, end_date } = parsedQuery.data
    const data = await fetchNeoFeed(start_date, end_date)
    res.json(data)
  } catch (error) {
    if (isUpstreamServiceError(error, 'NASA NeoWs')) {
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
