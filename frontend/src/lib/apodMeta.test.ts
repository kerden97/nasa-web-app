import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  APOD_EPOCH,
  formatApodLongDate,
  formatApodRelativeDate,
  isDirectVideo,
  getApodTeaser,
} from './apodMeta'

describe('APOD_EPOCH', () => {
  it('is the first APOD date', () => {
    expect(APOD_EPOCH).toBe('1995-06-16')
  })
})

describe('formatApodLongDate', () => {
  it('formats a date as weekday, day month year', () => {
    const result = formatApodLongDate('2026-03-13')
    expect(result).toContain('Friday')
    expect(result).toContain('13')
    expect(result).toContain('March')
    expect(result).toContain('2026')
  })

  it('handles the APOD epoch date', () => {
    const result = formatApodLongDate('1995-06-16')
    expect(result).toContain('Friday')
    expect(result).toContain('16')
    expect(result).toContain('June')
    expect(result).toContain('1995')
  })
})

describe('formatApodRelativeDate', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-13T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("returns 'today' for today's date", () => {
    expect(formatApodRelativeDate('2026-03-13')).toBe('today')
  })

  it('returns "1 day ago" for yesterday', () => {
    expect(formatApodRelativeDate('2026-03-12')).toBe('1 day ago')
  })

  it('returns "X days ago" for older dates', () => {
    expect(formatApodRelativeDate('2026-03-08')).toBe('5 days ago')
  })

  it('returns "in 1 day" for tomorrow', () => {
    expect(formatApodRelativeDate('2026-03-14')).toBe('in 1 day')
  })

  it('returns "in X days" for future dates', () => {
    expect(formatApodRelativeDate('2026-03-18')).toBe('in 5 days')
  })
})

describe('isDirectVideo', () => {
  it('returns true for .mp4 URLs', () => {
    expect(isDirectVideo('https://apod.nasa.gov/apod/image/2603/TotalLunarEclipse.mp4')).toBe(true)
  })

  it('returns true for .webm URLs', () => {
    expect(isDirectVideo('https://example.com/video.webm')).toBe(true)
  })

  it('returns true for .ogg URLs', () => {
    expect(isDirectVideo('https://example.com/video.ogg')).toBe(true)
  })

  it('returns true for .mp4 with query params', () => {
    expect(isDirectVideo('https://example.com/video.mp4?v=1')).toBe(true)
  })

  it('returns true for uppercase video extensions', () => {
    expect(isDirectVideo('https://example.com/VIDEO.MP4')).toBe(true)
  })

  it('returns false for YouTube embed URLs', () => {
    expect(isDirectVideo('https://www.youtube.com/embed/abc123')).toBe(false)
  })

  it('returns false for image URLs', () => {
    expect(isDirectVideo('https://example.com/image.jpg')).toBe(false)
  })
})

describe('getApodTeaser', () => {
  it('returns the full text if under max length', () => {
    expect(getApodTeaser('Short text')).toBe('Short text')
  })

  it('returns the full text when length exactly matches maxLength', () => {
    const text = 'a'.repeat(120)
    expect(getApodTeaser(text, 120)).toBe(text)
  })

  it('truncates long text with ellipsis', () => {
    const long = 'a'.repeat(200)
    const result = getApodTeaser(long)
    expect(result.length).toBeLessThanOrEqual(123)
    expect(result).toMatch(/\.\.\.$/)
  })

  it('normalizes whitespace', () => {
    expect(getApodTeaser('hello   world\n\ntest')).toBe('hello world test')
  })

  it('returns an empty string for whitespace-only input', () => {
    expect(getApodTeaser('   \n\t  ')).toBe('')
  })

  it('respects custom maxLength', () => {
    const result = getApodTeaser('hello world this is a test', 10)
    expect(result).toBe('hello worl...')
  })
})
