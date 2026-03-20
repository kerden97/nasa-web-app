import { describe, expect, it } from 'vitest'
import { formatUtcLongDate, formatUtcMediumDate, formatUtcShortDate } from './dateFormat'

describe('formatUtcLongDate', () => {
  it('formats a YYYY-MM-DD date with weekday, day, month, and year', () => {
    const result = formatUtcLongDate('2026-03-13')
    expect(result).toContain('Friday')
    expect(result).toContain('13')
    expect(result).toContain('March')
    expect(result).toContain('2026')
  })

  it('formats a date-time string with space separator', () => {
    const result = formatUtcLongDate('2024-12-25 14:30:00')
    expect(result).toContain('Wednesday')
    expect(result).toContain('25')
    expect(result).toContain('December')
    expect(result).toContain('2024')
  })

  it('formats an ISO 8601 string', () => {
    const result = formatUtcLongDate('2000-01-01T00:00:00Z')
    expect(result).toContain('Saturday')
    expect(result).toContain('1')
    expect(result).toContain('January')
    expect(result).toContain('2000')
  })
})

describe('formatUtcMediumDate', () => {
  it('formats a date with day, month, and year but no weekday', () => {
    const result = formatUtcMediumDate('2026-03-13')
    expect(result).toContain('13')
    expect(result).toContain('March')
    expect(result).toContain('2026')
    expect(result).not.toContain('Friday')
  })

  it('treats YYYY-MM-DD input as UTC to avoid timezone shifts', () => {
    const result = formatUtcMediumDate('2024-01-01')
    expect(result).toContain('1')
    expect(result).toContain('January')
    expect(result).toContain('2024')
  })
})

describe('formatUtcShortDate', () => {
  it('formats a date with abbreviated weekday and month', () => {
    const result = formatUtcShortDate('2026-03-13')
    expect(result).toContain('Fri')
    expect(result).toContain('13')
    expect(result).toContain('Mar')
    expect(result).toContain('2026')
  })

  it('formats a different date correctly', () => {
    const result = formatUtcShortDate('2024-07-04')
    expect(result).toContain('Thu')
    expect(result).toContain('4')
    expect(result).toContain('Jul')
    expect(result).toContain('2024')
  })

  it('handles date-time strings with space separator', () => {
    const result = formatUtcShortDate('2023-06-15 09:00:00')
    expect(result).toContain('Thu')
    expect(result).toContain('15')
    expect(result).toContain('Jun')
    expect(result).toContain('2023')
  })
})
