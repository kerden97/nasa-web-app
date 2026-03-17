import type { Request, Response, NextFunction } from 'express'
import { sendApiError } from '../lib/apiErrors'
import logger from '../lib/logger'

export function globalErrorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
  })

  sendApiError(res, 500, 'internal_server_error', 'Internal server error')
}
