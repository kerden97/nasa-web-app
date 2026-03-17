import type { Response } from 'express'

export interface ApiErrorResponse {
  error: string
  code: string
  status: number
}

export function sendApiError(
  res: Response,
  status: number,
  code: string,
  error: string,
): Response<ApiErrorResponse> {
  return res.status(status).json({ error, code, status })
}
