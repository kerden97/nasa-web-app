import type { Request, Response, NextFunction } from 'express'
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

  res.status(500).json({ error: 'Internal server error' })
}
