import type { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { sendApiError } from '../lib/apiErrors'
import { fetchApod } from '../services/apod'
import type { ApodQuery } from '../types/apod'
import { isValidDate } from '../lib/validation'

function dateField(errorCode: string, fieldName: string) {
  return z.preprocess(
    (value) => (typeof value === 'string' ? value : undefined),
    z
      .string()
      .optional()
      .superRefine((value, ctx) => {
        if (value !== undefined && !isValidDate(value)) {
          ctx.addIssue({
            code: 'custom',
            message: `Invalid ${fieldName} format. Use YYYY-MM-DD.`,
            params: { apiCode: errorCode },
          })
        }
      }),
  )
}

const countField = z.preprocess(
  (value) => (typeof value === 'string' ? value : undefined),
  z
    .string()
    .optional()
    .superRefine((value, ctx) => {
      if (value === undefined) return

      const parsed = /^\d+$/.test(value) ? Number(value) : NaN
      if (!(parsed >= 1 && parsed <= 100)) {
        ctx.addIssue({
          code: 'custom',
          message: 'count must be between 1 and 100.',
          params: { apiCode: 'invalid_count' },
        })
      }
    }),
)

const apodQuerySchema = z
  .object({
    date: dateField('invalid_date', 'date'),
    start_date: dateField('invalid_start_date', 'start_date'),
    end_date: dateField('invalid_end_date', 'end_date'),
    count: countField,
  })
  .superRefine((query, ctx) => {
    if (query.date && (query.start_date || query.end_date || query.count)) {
      ctx.addIssue({
        code: 'custom',
        path: ['date'],
        message: 'date cannot be combined with start_date, end_date, or count.',
        params: { apiCode: 'invalid_query_combination' },
      })
    }

    if (query.start_date && query.end_date && query.start_date > query.end_date) {
      ctx.addIssue({
        code: 'custom',
        path: ['start_date'],
        message: 'start_date cannot be later than end_date.',
        params: { apiCode: 'invalid_date_range' },
      })
    }
  })
  .transform(
    ({ date, start_date, end_date, count }): ApodQuery => ({
      ...(date === undefined ? {} : { date }),
      ...(start_date === undefined ? {} : { start_date }),
      ...(end_date === undefined ? {} : { end_date }),
      ...(count === undefined ? {} : { count: Number(count) }),
    }),
  )

function sendValidationError(res: Response, error: z.ZodError): void {
  const [issue] = error.issues
  const apiCode =
    issue &&
    issue.code === 'custom' &&
    'params' in issue &&
    issue.params &&
    typeof issue.params.apiCode === 'string'
      ? issue.params.apiCode
      : 'invalid_query'

  sendApiError(res, 400, apiCode, issue?.message ?? 'Invalid query parameters.')
}

export async function getApod(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsedQuery = apodQuerySchema.safeParse(req.query)

    if (!parsedQuery.success) {
      sendValidationError(res, parsedQuery.error)
      return
    }

    const data = await fetchApod(parsedQuery.data)
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
