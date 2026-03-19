jest.mock('../lib/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}))

describe('EPIC service', () => {
  const originalFetch = global.fetch
  let fetchEpicImages: typeof import('./epic').fetchEpicImages
  let fetchEpicDates: typeof import('./epic').fetchEpicDates

  beforeEach(async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-03-14T12:00:00Z'))
    jest.resetModules()
    ;({ fetchEpicImages, fetchEpicDates } = await import('./epic'))
  })

  afterEach(() => {
    global.fetch = originalFetch
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  const sampleApiItem = {
    identifier: '20260312003633',
    caption: 'Earth from DSCOVR',
    image: 'epic_1b_20260312003633',
    date: '2026-03-12 00:36:33',
    centroid_coordinates: { lat: 12.5, lon: -45.2 },
  }

  describe('fetchEpicImages', () => {
    it('fetches and maps EPIC images with correct image URLs', async () => {
      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => [sampleApiItem],
      })

      global.fetch = fetchMock as typeof fetch

      const result = await fetchEpicImages('natural')

      expect(result).toHaveLength(1)
      expect(result[0]!.identifier).toBe('20260312003633')
      expect(result[0]!.caption).toBe('Earth from DSCOVR')
      expect(result[0]!.image).toBe(
        'https://epic.gsfc.nasa.gov/archive/natural/2026/03/12/jpg/epic_1b_20260312003633.jpg',
      )
      expect(result[0]!.centroid_coordinates).toEqual({ lat: 12.5, lon: -45.2 })

      const calledUrl = fetchMock.mock.calls[0]![0] as string
      expect(calledUrl).toContain('/natural')
    })

    it('builds correct image URL for enhanced collection', async () => {
      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => [sampleApiItem],
      })

      global.fetch = fetchMock as typeof fetch

      const result = await fetchEpicImages('enhanced')

      expect(result[0]!.image).toContain('/enhanced/')
      const calledUrl = fetchMock.mock.calls[0]![0] as string
      expect(calledUrl).toContain('/enhanced')
    })

    it('appends date path when date is provided', async () => {
      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => [],
      })

      global.fetch = fetchMock as typeof fetch

      await fetchEpicImages('natural', '2026-03-10')

      const calledUrl = fetchMock.mock.calls[0]![0] as string
      expect(calledUrl).toContain('/natural/date/2026-03-10')
    })

    it('caches EPIC image results for dated requests', async () => {
      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => [sampleApiItem],
      })

      global.fetch = fetchMock as typeof fetch

      const first = await fetchEpicImages('natural', '2026-03-12')
      const second = await fetchEpicImages('natural', '2026-03-12')

      expect(first).toEqual(second)
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('caches latest EPIC images within the same UTC day', async () => {
      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => [sampleApiItem],
      })

      global.fetch = fetchMock as typeof fetch

      const first = await fetchEpicImages('natural')
      const second = await fetchEpicImages('natural')

      expect(first).toEqual(second)
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('invalidates latest EPIC images cache after UTC midnight rollover', async () => {
      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => [sampleApiItem],
      })

      global.fetch = fetchMock as typeof fetch

      await fetchEpicImages('natural')

      jest.setSystemTime(new Date('2026-03-15T01:00:00Z'))

      await fetchEpicImages('natural')

      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it('serves stale latest EPIC images when NASA fails after UTC midnight rollover', async () => {
      const successMock = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => [sampleApiItem],
      })

      global.fetch = successMock as typeof fetch

      const first = await fetchEpicImages('natural')
      expect(first).toHaveLength(1)

      jest.setSystemTime(new Date('2026-03-15T01:00:00Z'))

      const failMock = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      })
      global.fetch = failMock as typeof fetch

      const promise = fetchEpicImages('natural')
      await jest.advanceTimersByTimeAsync(1000)
      await jest.advanceTimersByTimeAsync(2000)
      const stale = await promise

      expect(stale).toEqual(first)
      expect(failMock).toHaveBeenCalledTimes(3)
    })

    it('does not cache empty results', async () => {
      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => [],
      })

      global.fetch = fetchMock as typeof fetch

      await fetchEpicImages('natural', '2020-01-01')
      await fetchEpicImages('natural', '2020-01-01')

      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it('uses separate cache keys for different collections', async () => {
      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => [sampleApiItem],
      })

      global.fetch = fetchMock as typeof fetch

      await fetchEpicImages('natural', '2026-03-12')
      await fetchEpicImages('enhanced', '2026-03-12')

      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it('retries transient errors and succeeds on third attempt', async () => {
      const fetchMock = jest
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 502, text: async () => 'Bad Gateway' })
        .mockResolvedValueOnce({ ok: false, status: 503, text: async () => 'Unavailable' })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [sampleApiItem],
        })

      global.fetch = fetchMock as typeof fetch

      const promise = fetchEpicImages('natural', '2026-03-12')
      await jest.advanceTimersByTimeAsync(1000)
      await jest.advanceTimersByTimeAsync(2000)
      const result = await promise

      expect(result).toHaveLength(1)
      expect(fetchMock).toHaveBeenCalledTimes(3)
    })

    it('throws after all retries are exhausted', async () => {
      const fetchMock = jest.fn().mockResolvedValue({
        ok: false,
        status: 503,
        text: async () => 'Service Unavailable',
      })

      global.fetch = fetchMock as typeof fetch

      const promise = fetchEpicImages('natural', '2026-03-12').catch((e: Error) => e)
      await jest.advanceTimersByTimeAsync(1000)
      await jest.advanceTimersByTimeAsync(2000)
      const error = await promise

      expect(error).toBeInstanceOf(Error)
      expect((error as Error).message).toContain('NASA EPIC API responded with 503')
      expect(fetchMock).toHaveBeenCalledTimes(3)
    })

    it('retries network failures and throws an upstream error after exhaustion', async () => {
      const fetchMock = jest.fn().mockRejectedValue(new Error('socket hang up'))

      global.fetch = fetchMock as typeof fetch

      const promise = fetchEpicImages('natural', '2026-03-12').catch((e: Error) => e)
      await jest.advanceTimersByTimeAsync(1000)
      await jest.advanceTimersByTimeAsync(2000)
      const error = await promise

      expect(error).toBeInstanceOf(Error)
      expect((error as Error).message).toContain('NASA EPIC API request failed: socket hang up')
      expect(fetchMock).toHaveBeenCalledTimes(3)
    })

    it('deduplicates concurrent identical requests', async () => {
      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => [sampleApiItem],
      })

      global.fetch = fetchMock as typeof fetch

      const [first, second] = await Promise.all([
        fetchEpicImages('natural', '2026-03-12'),
        fetchEpicImages('natural', '2026-03-12'),
      ])

      expect(first).toEqual(second)
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('does not retry on non-transient errors (e.g. 400)', async () => {
      const fetchMock = jest.fn().mockResolvedValue({
        ok: false,
        status: 400,
        text: async () => 'Bad Request',
      })

      global.fetch = fetchMock as typeof fetch

      await expect(fetchEpicImages('natural', '2026-03-12')).rejects.toThrow(
        'NASA EPIC API responded with 400',
      )
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('blocks retries during cooldown after failure', async () => {
      const fetchMock = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      })

      global.fetch = fetchMock as typeof fetch

      const firstAttempt = fetchEpicImages('natural', '2026-03-12').catch((e: Error) => e)
      await jest.advanceTimersByTimeAsync(1000)
      await jest.advanceTimersByTimeAsync(2000)
      await firstAttempt

      fetchMock.mockClear()

      await expect(fetchEpicImages('natural', '2026-03-12')).rejects.toThrow(
        'NASA EPIC API responded with 500',
      )
      expect(fetchMock).toHaveBeenCalledTimes(0)
    })
  })

  describe('fetchEpicDates', () => {
    it('fetches and returns sorted dates in reverse order', async () => {
      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ date: '2026-03-10' }, { date: '2026-03-12' }, { date: '2026-03-11' }],
      })

      global.fetch = fetchMock as typeof fetch

      const result = await fetchEpicDates('natural')

      expect(result).toEqual(['2026-03-12', '2026-03-11', '2026-03-10'])
    })

    it('caches date results within the same UTC day', async () => {
      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ date: '2026-03-12' }],
      })

      global.fetch = fetchMock as typeof fetch

      const first = await fetchEpicDates('natural')
      const second = await fetchEpicDates('natural')

      expect(first).toEqual(second)
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('invalidates dates cache after UTC midnight rollover', async () => {
      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ date: '2026-03-14' }],
      })

      global.fetch = fetchMock as typeof fetch

      await fetchEpicDates('natural')

      // Advance to next UTC day
      jest.setSystemTime(new Date('2026-03-15T01:00:00Z'))

      await fetchEpicDates('natural')

      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it('uses separate cache keys for different collections', async () => {
      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ date: '2026-03-12' }],
      })

      global.fetch = fetchMock as typeof fetch

      await fetchEpicDates('natural')
      await fetchEpicDates('enhanced')

      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it('retries transient errors and succeeds on third attempt', async () => {
      const fetchMock = jest
        .fn()
        .mockResolvedValueOnce({ ok: false, status: 500, text: async () => 'Error' })
        .mockResolvedValueOnce({ ok: false, status: 502, text: async () => 'Bad Gateway' })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [{ date: '2026-03-14' }],
        })

      global.fetch = fetchMock as typeof fetch

      const promise = fetchEpicDates('natural')
      await jest.advanceTimersByTimeAsync(1000)
      await jest.advanceTimersByTimeAsync(2000)
      const result = await promise

      expect(result).toEqual(['2026-03-14'])
      expect(fetchMock).toHaveBeenCalledTimes(3)
    })

    it('throws after all retries are exhausted', async () => {
      const fetchMock = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      })

      global.fetch = fetchMock as typeof fetch

      const promise = fetchEpicDates('natural').catch((e: Error) => e)
      await jest.advanceTimersByTimeAsync(1000)
      await jest.advanceTimersByTimeAsync(2000)
      const error = await promise

      expect(error).toBeInstanceOf(Error)
      expect((error as Error).message).toContain('NASA EPIC API responded with 500')
      expect(fetchMock).toHaveBeenCalledTimes(3)
    })

    it('retries date-request network failures and throws an upstream error after exhaustion', async () => {
      const fetchMock = jest.fn().mockRejectedValue(new Error('socket hang up'))

      global.fetch = fetchMock as typeof fetch

      const promise = fetchEpicDates('natural').catch((e: Error) => e)
      await jest.advanceTimersByTimeAsync(1000)
      await jest.advanceTimersByTimeAsync(2000)
      const error = await promise

      expect(error).toBeInstanceOf(Error)
      expect((error as Error).message).toContain('NASA EPIC API request failed: socket hang up')
      expect(fetchMock).toHaveBeenCalledTimes(3)
    })

    it('deduplicates concurrent identical date requests', async () => {
      const fetchMock = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ date: '2026-03-14' }],
      })

      global.fetch = fetchMock as typeof fetch

      const [first, second] = await Promise.all([
        fetchEpicDates('natural'),
        fetchEpicDates('natural'),
      ])

      expect(first).toEqual(second)
      expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it('serves stale dates when NASA fails after midnight rollover', async () => {
      // Populate cache on day 1
      const successMock = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => [{ date: '2026-03-14' }, { date: '2026-03-13' }],
      })

      global.fetch = successMock as typeof fetch

      const first = await fetchEpicDates('natural')
      expect(first).toEqual(['2026-03-14', '2026-03-13'])

      // Advance to next UTC day — cache invalidates
      jest.setSystemTime(new Date('2026-03-15T01:00:00Z'))

      // NASA is now down — all retries fail
      const failMock = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      })
      global.fetch = failMock as typeof fetch

      const promise = fetchEpicDates('natural')
      await jest.advanceTimersByTimeAsync(1000)
      await jest.advanceTimersByTimeAsync(2000)
      const stale = await promise

      // Stale cache served instead of throwing
      expect(stale).toEqual(['2026-03-14', '2026-03-13'])
      expect(failMock).toHaveBeenCalledTimes(3)
    })

    it('blocks retries during cooldown after failure', async () => {
      const fetchMock = jest.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      })

      global.fetch = fetchMock as typeof fetch

      const firstAttempt = fetchEpicDates('natural').catch((e: Error) => e)
      await jest.advanceTimersByTimeAsync(1000)
      await jest.advanceTimersByTimeAsync(2000)
      await firstAttempt

      fetchMock.mockClear()

      await expect(fetchEpicDates('natural')).rejects.toThrow('NASA EPIC API responded with 500')
      expect(fetchMock).toHaveBeenCalledTimes(0)
    })
  })
})
