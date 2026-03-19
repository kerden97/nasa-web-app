import type { Request, Response, NextFunction } from 'express'
import { sendApiError } from '../lib/apiErrors'
import logger from '../lib/logger'
import { isUpstreamServiceError } from '../lib/upstreamService'

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (isUpstreamServiceError(err)) {
    logger.error('Unhandled upstream service error', {
      error: err.message,
      stack: err.stack,
      method: req.method,
      path: req.path,
    })

    sendApiError(
      res,
      502,
      'upstream_service_unavailable',
      'An upstream service is temporarily unavailable. Please try again shortly.',
    )
    return
  }

  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
  })

  sendApiError(res, 500, 'internal_server_error', 'Internal server error')
}
