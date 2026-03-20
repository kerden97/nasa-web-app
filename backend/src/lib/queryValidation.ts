import type { Response } from 'express'
import { z } from 'zod'
import { isValidDate } from './validation'

export function toUtcDate(value: string): Date {
  const [yearStr, monthStr, dayStr] = value.split('-')
  return new Date(Date.UTC(Number(yearStr), Number(monthStr) - 1, Number(dayStr)))
}

export function dateField(errorCode: string, message: string, required = false) {
  const schema = z.preprocess(
    (value) => (typeof value === 'string' ? value : undefined),
    z
      .string()
      .optional()
      .superRefine((value, ctx) => {
        if (value === undefined) {
          if (required) {
            ctx.addIssue({
              code: 'custom',
              message,
              params: { apiCode: errorCode },
            })
          }
          return
        }

        if (!isValidDate(value)) {
          ctx.addIssue({
            code: 'custom',
            message,
            params: { apiCode: errorCode },
          })
        }
      }),
  )

  return required ? schema.transform((value) => value as string) : schema
}

export function requiredDateField(errorCode: string, message: string) {
  return z
    .preprocess(
      (value) => (typeof value === 'string' ? value : undefined),
      z.union([z.string(), z.undefined()]).superRefine((value, ctx) => {
        if (value === undefined || !isValidDate(value)) {
          ctx.addIssue({
            code: 'custom',
            message,
            params: { apiCode: errorCode },
          })
        }
      }),
    )
    .transform((value) => value as string)
}

export const neoDateRangeQuerySchema = z
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

export function sendZodQueryError(
  res: Response,
  sendApiError: (res: Response, status: number, code: string, error: string) => Response,
  error: z.ZodError,
): void {
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
