import { todayUTC } from './date'

describe('todayUTC', () => {
  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns a string in YYYY-MM-DD format', () => {
    const result = todayUTC()

    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('returns the current UTC date', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-03-20T15:30:00Z'))

    expect(todayUTC()).toBe('2026-03-20')
  })

  it('uses UTC, not local time, near midnight', () => {
    jest.useFakeTimers()
    // 11:30 PM UTC on March 20 — local time could be March 21 in UTC+1
    jest.setSystemTime(new Date('2026-03-20T23:30:00Z'))

    expect(todayUTC()).toBe('2026-03-20')
  })

  it('handles the first day of the year', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-01-01T00:00:00Z'))

    expect(todayUTC()).toBe('2026-01-01')
  })

  it('handles the last day of the year', () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2025-12-31T23:59:59Z'))

    expect(todayUTC()).toBe('2025-12-31')
  })
})
