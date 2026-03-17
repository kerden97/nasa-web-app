jest.mock('../lib/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}))

describe('APOD service', () => {
  const originalFetch = global.fetch
  let fetchApod: typeof import('./apod').fetchApod

  beforeEach(async () => {
    jest.resetModules()
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-03-13T12:00:00Z'))
    ;({ fetchApod } = await import('./apod'))
  })

  afterEach(() => {
    global.fetch = originalFetch
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  it('caches past single-date APOD responses', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        date: '2026-03-10',
        title: 'Sky Glows',
        explanation: 'Test explanation',
        url: 'https://example.com/apod.jpg',
        media_type: 'image',
        service_version: 'v1',
      }),
    })

    global.fetch = fetchMock as typeof fetch

    const first = await fetchApod({ date: '2026-03-10' })
    const second = await fetchApod({ date: '2026-03-10' })

    expect(first).toEqual(second)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('returns exactly count items when using count param', async () => {
    const items = Array.from({ length: 26 }, (_, i) => {
      const day = String(13 - i).padStart(2, '0')
      const date = new Date(`2026-03-13T00:00:00Z`)
      date.setUTCDate(date.getUTCDate() - i)

      return {
        date: date.toISOString().split('T')[0],
        title: `APOD ${day}`,
        explanation: 'Test',
        url: `https://example.com/${day}.jpg`,
        media_type: 'image' as const,
        service_version: 'v1',
      }
    })

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => items,
    })

    global.fetch = fetchMock as typeof fetch

    const result = await fetchApod({ count: 21 })

    expect(Array.isArray(result)).toBe(true)
    expect(result as typeof items).toHaveLength(21)
  })

  it('returns items when using end_date with count', async () => {
    const items = Array.from({ length: 15 }, (_, i) => {
      const date = new Date('2026-02-20T00:00:00Z')
      date.setUTCDate(date.getUTCDate() - i)

      return {
        date: date.toISOString().split('T')[0],
        title: `APOD ${i}`,
        explanation: 'Test',
        url: `https://example.com/${i}.jpg`,
        media_type: 'image' as const,
        service_version: 'v1',
      }
    })

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => items,
    })

    global.fetch = fetchMock as typeof fetch

    const result = await fetchApod({ end_date: '2026-02-20', count: 10 })

    expect(Array.isArray(result)).toBe(true)
    expect(result as typeof items).toHaveLength(10)
  })

  it('serves cached today until UTC rollover without re-fetching', async () => {
    const today = '2026-03-13'

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        date: today,
        title: 'Today APOD',
        explanation: 'Fresh payload',
        url: 'https://example.com/today.jpg',
        media_type: 'image',
        service_version: 'v1',
      }),
    })

    global.fetch = fetchMock as typeof fetch

    const fresh = await fetchApod({ date: today })
    const cached = await fetchApod({ date: today })

    expect(cached).toEqual(fresh)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("invalidates today's cache after UTC midnight and re-fetches same date", async () => {
    const apodData = {
      date: '2026-03-13',
      title: 'Today APOD',
      explanation: 'Test',
      url: 'https://example.com/today.jpg',
      media_type: 'image',
      service_version: 'v1',
    }

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => apodData,
    })

    global.fetch = fetchMock as typeof fetch

    // Fetch today — hits NASA
    await fetchApod({ date: '2026-03-13' })
    // Same-day re-fetch — served from cache
    await fetchApod({ date: '2026-03-13' })
    expect(fetchMock).toHaveBeenCalledTimes(1)

    // Clock rolls past midnight — "2026-03-13" was cached as today
    jest.setSystemTime(new Date('2026-03-14T00:00:01Z'))

    // Re-request same date — cache invalidated because it was "today"
    await fetchApod({ date: '2026-03-13' })
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('deduplicates concurrent identical single-date requests', async () => {
    let resolveFetch!: (value: unknown) => void

    const fetchMock = jest.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve
        }),
    )

    global.fetch = fetchMock as typeof fetch

    const p1 = fetchApod({ date: '2026-03-08' })
    const p2 = fetchApod({ date: '2026-03-08' })

    resolveFetch({
      ok: true,
      json: async () => ({
        date: '2026-03-08',
        title: 'Dual Fetch',
        explanation: 'Test dedup',
        url: 'https://example.com/dedup.jpg',
        media_type: 'image',
        service_version: 'v1',
      }),
    })

    const [r1, r2] = await Promise.all([p1, p2])

    expect(r1).toEqual(r2)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('skips NASA API during cooldown after repeated failures', async () => {
    const failMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Internal Service Error',
    })

    global.fetch = failMock as typeof fetch

    // First fetch — exhausts all 3 retries and fails
    // Capture rejection eagerly so Node doesn't warn about unhandled rejection
    let firstError: Error | undefined
    const promise = fetchApod({ date: '2026-03-09' }).catch((e: Error) => {
      firstError = e
    })
    // Advance through retry delays: attempt 1 delay = 1s, attempt 2 delay = 2s
    await jest.advanceTimersByTimeAsync(1000)
    await jest.advanceTimersByTimeAsync(2000)
    await promise
    expect(firstError?.message).toMatch(/NASA API/)
    expect(failMock).toHaveBeenCalledTimes(3)

    // Immediate retry — should be blocked by cooldown, no new fetch calls
    failMock.mockClear()
    let cooldownError: Error | undefined
    try {
      await fetchApod({ date: '2026-03-09' })
    } catch (e) {
      cooldownError = e as Error
    }
    expect(cooldownError?.message).toBe('NASA API responded with 500')
    expect(failMock).toHaveBeenCalledTimes(0)
  })

  it('serves stale cached range items when NASA fails for the missing portion', async () => {
    const cachedItems = [
      {
        date: '2026-03-10',
        title: 'APOD 10',
        explanation: 'Test',
        url: 'https://example.com/10.jpg',
        media_type: 'image' as const,
        service_version: 'v1',
      },
      {
        date: '2026-03-11',
        title: 'APOD 11',
        explanation: 'Test',
        url: 'https://example.com/11.jpg',
        media_type: 'image' as const,
        service_version: 'v1',
      },
    ]

    const failResponse = {
      ok: false,
      status: 500,
      text: async () => 'Internal Service Error',
    }

    const fetchMock = jest
      .fn()
      // Seed cache for 03-10 and 03-11
      .mockResolvedValueOnce({
        ok: true,
        json: async () => cachedItems,
      })
      // Fail all 3 retries when fetching the missing 03-12
      .mockResolvedValueOnce(failResponse)
      .mockResolvedValueOnce(failResponse)
      .mockResolvedValueOnce(failResponse)

    global.fetch = fetchMock as typeof fetch

    // First call — seeds cache with 03-10 and 03-11
    await fetchApod({ start_date: '2026-03-10', end_date: '2026-03-11' })

    // Second call — wider range includes uncached 03-12
    // fetchRange will try NASA for 03-12, fail after 3 retries, fall back to stale
    const promise = fetchApod({ start_date: '2026-03-10', end_date: '2026-03-12' })
    // Advance through retry delays: attempt 1 = 1s, attempt 2 = 2s
    await jest.advanceTimersByTimeAsync(1000)
    await jest.advanceTimersByTimeAsync(2000)

    const result = await promise

    expect(Array.isArray(result)).toBe(true)
    // Only the previously cached dates are returned (reversed = newest first)
    expect((result as typeof cachedItems).map((x) => x.date)).toEqual(['2026-03-11', '2026-03-10'])
  })

  it('retries transient NASA errors and eventually succeeds', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal Service Error',
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 503,
        text: async () => 'Unavailable',
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          date: '2026-03-10',
          title: 'Recovered',
          explanation: 'Test',
          url: 'https://example.com/recovered.jpg',
          media_type: 'image',
          service_version: 'v1',
        }),
      })

    global.fetch = fetchMock as typeof fetch

    const promise = fetchApod({ date: '2026-03-10' })

    await jest.advanceTimersByTimeAsync(1000)
    await jest.advanceTimersByTimeAsync(2000)

    const result = await promise

    expect((result as unknown as Record<string, unknown>).title).toBe('Recovered')
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('falls back to the previous APOD when the latest date is unavailable', async () => {
    const failResponse = {
      ok: false,
      status: 500,
      text: async () => 'Internal Service Error',
    }

    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(failResponse)
      .mockResolvedValueOnce(failResponse)
      .mockResolvedValueOnce(failResponse)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          date: '2026-03-12',
          title: 'Previous day APOD',
          explanation: 'Fallback payload',
          url: 'https://example.com/previous.jpg',
          media_type: 'image',
          service_version: 'v1',
        }),
      })

    global.fetch = fetchMock as typeof fetch

    const promise = fetchApod({ date: '2026-03-13' })
    await jest.advanceTimersByTimeAsync(1000)
    await jest.advanceTimersByTimeAsync(2000)

    const result = await promise

    expect((result as { date: string }).date).toBe('2026-03-12')
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })

  it('falls back to the previous available range when the newest APOD day is unavailable', async () => {
    const failResponse = {
      ok: false,
      status: 500,
      text: async () => 'Internal Service Error',
    }

    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce(failResponse)
      .mockResolvedValueOnce(failResponse)
      .mockResolvedValueOnce(failResponse)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => [
          {
            date: '2026-03-11',
            title: 'APOD 11',
            explanation: 'Test',
            url: 'https://example.com/11.jpg',
            media_type: 'image' as const,
            service_version: 'v1',
          },
          {
            date: '2026-03-12',
            title: 'APOD 12',
            explanation: 'Test',
            url: 'https://example.com/12.jpg',
            media_type: 'image' as const,
            service_version: 'v1',
          },
        ],
      })

    global.fetch = fetchMock as typeof fetch

    const promise = fetchApod({ start_date: '2026-03-11', end_date: '2026-03-13' })
    await jest.advanceTimersByTimeAsync(1000)
    await jest.advanceTimersByTimeAsync(2000)

    const result = await promise

    expect(Array.isArray(result)).toBe(true)
    expect((result as { date: string }[]).map((item) => item.date)).toEqual([
      '2026-03-12',
      '2026-03-11',
    ])
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })
})
