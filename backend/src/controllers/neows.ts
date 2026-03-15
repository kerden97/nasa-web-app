import type { Request, Response, NextFunction } from 'express'
import { fetchNeoFeed } from '../services/neows'

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

function toUtcDate(value: string): Date {
  const [yearStr, monthStr, dayStr] = value.split('-')
  return new Date(Date.UTC(Number(yearStr), Number(monthStr) - 1, Number(dayStr)))
}

function isValidDate(value: string): boolean {
  if (!DATE_REGEX.test(value)) return false

  const [yearStr, monthStr, dayStr] = value.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)
  const parsed = new Date(Date.UTC(year, month - 1, day))

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  )
}

export async function getNeoFeed(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { start_date, end_date } = req.query

    if (typeof start_date !== 'string' || !isValidDate(start_date)) {
      res.status(400).json({ error: 'Invalid or missing start_date. Use YYYY-MM-DD.' })
      return
    }

    if (typeof end_date !== 'string' || !isValidDate(end_date)) {
      res.status(400).json({ error: 'Invalid or missing end_date. Use YYYY-MM-DD.' })
      return
    }

    // NASA NeoWs allows a maximum 7-day range
    const start = toUtcDate(start_date)
    const end = toUtcDate(end_date)
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)

    if (diffDays < 0) {
      res.status(400).json({ error: 'start_date must be before or equal to end_date.' })
      return
    }

    if (diffDays > 6) {
      res.status(400).json({ error: 'Date range cannot exceed 7 days.' })
      return
    }

    const data = await fetchNeoFeed(start_date, end_date)
    res.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (message.includes('NASA NeoWs')) {
      res.status(502).json({
        error: "NASA's NeoWs API is temporarily unavailable. Please try again shortly.",
      })
      return
    }
    next(error)
  }
}
