import type { Request, Response, NextFunction } from 'express'
import { fetchEpicImages, fetchEpicDates } from '../services/epic'
import type { EpicCollection } from '../types/epic'
import { isValidDate } from '../lib/validation'

const VALID_COLLECTIONS = ['natural', 'enhanced'] as const

export async function getEpicImages(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { collection, date } = req.query

    const col: EpicCollection =
      typeof collection === 'string' && VALID_COLLECTIONS.includes(collection as EpicCollection)
        ? (collection as EpicCollection)
        : 'natural'

    if (typeof date === 'string' && !isValidDate(date)) {
      res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' })
      return
    }

    const data = await fetchEpicImages(col, typeof date === 'string' ? date : undefined)
    res.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (message.includes('NASA EPIC')) {
      res.status(502).json({
        error: "NASA's EPIC API is temporarily unavailable. Please try again shortly.",
      })
      return
    }
    next(error)
  }
}

export async function getEpicDates(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { collection } = req.query

    const col: EpicCollection =
      typeof collection === 'string' && VALID_COLLECTIONS.includes(collection as EpicCollection)
        ? (collection as EpicCollection)
        : 'natural'

    const data = await fetchEpicDates(col)
    res.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (message.includes('NASA EPIC')) {
      res.status(502).json({
        error: "NASA's EPIC API is temporarily unavailable. Please try again shortly.",
      })
      return
    }
    next(error)
  }
}
