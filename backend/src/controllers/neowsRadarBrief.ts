import type { NextFunction, Request, Response } from 'express'
import { sendApiError } from '../lib/apiErrors'
import { neoDateRangeQuerySchema, sendZodQueryError } from '../lib/queryValidation'
import { fetchNeoRadarBrief } from '../services/neowsRadarBrief'
import { isUpstreamServiceError } from '../lib/upstreamService'

export async function getNeoRadarBrief(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsedQuery = neoDateRangeQuerySchema.safeParse(req.query)

    if (!parsedQuery.success) {
      sendZodQueryError(res, sendApiError, parsedQuery.error)
      return
    }

    const { start_date, end_date } = parsedQuery.data
    const data = await fetchNeoRadarBrief(start_date, end_date)
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
