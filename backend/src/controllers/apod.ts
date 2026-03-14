import type { Request, Response, NextFunction } from 'express'
import { fetchApod } from '../services/apod'
import type { ApodQuery } from '../types/apod'

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

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

export async function getApod(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { date, start_date, end_date, count } = req.query

    const query: ApodQuery = {}

    if (typeof date === 'string') {
      if (!isValidDate(date)) {
        res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' })
        return
      }
      query.date = date
    }

    if (typeof start_date === 'string') {
      if (!isValidDate(start_date)) {
        res.status(400).json({ error: 'Invalid start_date format. Use YYYY-MM-DD.' })
        return
      }
      query.start_date = start_date
    }

    if (typeof end_date === 'string') {
      if (!isValidDate(end_date)) {
        res.status(400).json({ error: 'Invalid end_date format. Use YYYY-MM-DD.' })
        return
      }
      query.end_date = end_date
    }

    if (typeof count === 'string') {
      const parsed = /^\d+$/.test(count) ? Number(count) : NaN
      if (!(parsed >= 1 && parsed <= 100)) {
        res.status(400).json({ error: 'count must be between 1 and 100.' })
        return
      }
      query.count = parsed
    }

    if (query.date && (query.start_date || query.end_date || query.count)) {
      res.status(400).json({
        error: 'date cannot be combined with start_date, end_date, or count.',
      })
      return
    }

    if (query.start_date && query.end_date && query.start_date > query.end_date) {
      res.status(400).json({
        error: 'start_date cannot be later than end_date.',
      })
      return
    }

    const data = await fetchApod(query)
    res.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (message.includes('NASA API')) {
      res.status(502).json({
        error: "NASA's API is temporarily unavailable for this date. Please try again shortly.",
      })
      return
    }
    next(error)
  }
}
