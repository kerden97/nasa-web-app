jest.mock('../lib/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}))

describe('NeoWs service', () => {
  const originalFetch = global.fetch
  let fetchNeoFeed: typeof import('./neows').fetchNeoFeed

  beforeEach(async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-03-14T12:00:00Z'))
    jest.resetModules()
    ;({ fetchNeoFeed } = await import('./neows'))
  })

  afterEach(() => {
    global.fetch = originalFetch
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  const mockApiResponse = (neos: unknown[], date = '2026-03-14') => ({
    element_count: neos.length,
    near_earth_objects: {
      [date]: neos,
    },
  })

  const sampleNeo = {
    id: '3840689',
    name: '(2019 FO)',
    nasa_jpl_url: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=3840689',
    absolute_magnitude_h: 25.1,
    estimated_diameter: {
      kilometers: { estimated_diameter_min: 0.025, estimated_diameter_max: 0.056 },
      meters: { estimated_diameter_min: 25, estimated_diameter_max: 56 },
    },
    is_potentially_hazardous_asteroid: false,
    close_approach_data: [
      {
        close_approach_date: '2026-03-14',
        close_approach_date_full: '2026-Mar-14 09:30',
        epoch_date_close_approach: 1773572400000,
        relative_velocity: {
          kilometers_per_second: '12.345',
          kilometers_per_hour: '44442.0',
          miles_per_hour: '27614.0',
        },
        miss_distance: {
          astronomical: '0.03',
          lunar: '11.67',
          kilometers: '4487000',
          miles: '2787000',
        },
        orbiting_body: 'Earth',
      },
    ],
    is_sentry_object: false,
  }

  it('fetches and maps NeoWs feed results', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse([sampleNeo]),
    })

    global.fetch = fetchMock as typeof fetch

    const result = await fetchNeoFeed('2026-03-14', '2026-03-14')

    expect(result.element_count).toBe(1)
    expect(result.near_earth_objects['2026-03-14']).toHaveLength(1)
    expect(result.near_earth_objects['2026-03-14']![0]!.id).toBe('3840689')
    expect(result.near_earth_objects['2026-03-14']![0]!.name).toBe('(2019 FO)')
    expect(result.near_earth_objects['2026-03-14']![0]!.is_potentially_hazardous_asteroid).toBe(
      false,
    )
    expect(
      result.near_earth_objects['2026-03-14']![0]!.close_approach_data[0]!.miss_distance.kilometers,
    ).toBe('4487000')
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const calledUrl = fetchMock.mock.calls[0]![0] as string
    expect(calledUrl).toContain('start_date=2026-03-14')
    expect(calledUrl).toContain('end_date=2026-03-14')
  })

  it('caches results for past date ranges', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse([sampleNeo], '2026-03-10'),
    })

    global.fetch = fetchMock as typeof fetch

    const first = await fetchNeoFeed('2026-03-10', '2026-03-10')
    const second = await fetchNeoFeed('2026-03-10', '2026-03-10')

    expect(first).toEqual(second)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('keeps cache for ranges that become fully past after midnight rollover', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse([sampleNeo]),
    })

    global.fetch = fetchMock as typeof fetch

    await fetchNeoFeed('2026-03-14', '2026-03-14')

    // Advance to next UTC day
    jest.setSystemTime(new Date('2026-03-15T01:00:00Z'))

    await fetchNeoFeed('2026-03-14', '2026-03-14')

    // Past date range after rollover — still cached from first call
    // But the endDate (2026-03-14) < todayUTC (2026-03-15), so it should be cached
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('retries transient errors and succeeds on third attempt', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500, text: async () => 'Error' })
      .mockResolvedValueOnce({ ok: false, status: 503, text: async () => 'Unavailable' })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse([sampleNeo]),
      })

    global.fetch = fetchMock as typeof fetch

    const promise = fetchNeoFeed('2026-03-14', '2026-03-14')
    await jest.advanceTimersByTimeAsync(1000)
    await jest.advanceTimersByTimeAsync(2000)
    const result = await promise

    expect(result.element_count).toBe(1)
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('throws after all transient HTTP retries are exhausted', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    })

    global.fetch = fetchMock as typeof fetch

    const promise = fetchNeoFeed('2026-03-14', '2026-03-14').catch((e: Error) => e)
    await jest.advanceTimersByTimeAsync(1000)
    await jest.advanceTimersByTimeAsync(2000)
    const error = await promise

    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toContain('NASA NeoWs API responded with 500')
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('does not retry on non-transient errors (e.g. 400)', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => 'Bad Request',
    })

    global.fetch = fetchMock as typeof fetch

    await expect(fetchNeoFeed('2026-03-14', '2026-03-14')).rejects.toThrow(
      'NASA NeoWs API responded with 400',
    )
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('deduplicates concurrent identical requests', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse([sampleNeo]),
    })

    global.fetch = fetchMock as typeof fetch

    const [first, second] = await Promise.all([
      fetchNeoFeed('2026-03-14', '2026-03-14'),
      fetchNeoFeed('2026-03-14', '2026-03-14'),
    ])

    expect(first).toEqual(second)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('blocks retries during cooldown after failure', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    })

    global.fetch = fetchMock as typeof fetch

    const firstAttempt = fetchNeoFeed('2026-03-14', '2026-03-14').catch((e: Error) => e)
    await jest.advanceTimersByTimeAsync(1000)
    await jest.advanceTimersByTimeAsync(2000)
    await firstAttempt

    fetchMock.mockClear()

    await expect(fetchNeoFeed('2026-03-14', '2026-03-14')).rejects.toThrow(
      'NASA NeoWs API responded with 500',
    )
    expect(fetchMock).toHaveBeenCalledTimes(0)
  })

  it('serves stale cache when NASA fails after midnight rollover', async () => {
    // Range 2026-03-14 to 2026-03-15 includes today (2026-03-14) as start
    // and tomorrow as end — after midnight rollover, endDate >= todayUTC
    // so the cached entry becomes stale and a refetch is attempted
    const successMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse([sampleNeo], '2026-03-15'),
    })

    global.fetch = successMock as typeof fetch

    const first = await fetchNeoFeed('2026-03-14', '2026-03-15')
    expect(first.element_count).toBe(1)

    // Advance to next UTC day — endDate (2026-03-15) >= todayUTC (2026-03-15)
    // so the cache entry is stale and a refetch is triggered
    jest.setSystemTime(new Date('2026-03-15T01:00:00Z'))

    const failMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    })
    global.fetch = failMock as typeof fetch

    const promise = fetchNeoFeed('2026-03-14', '2026-03-15')
    await jest.advanceTimersByTimeAsync(1000)
    await jest.advanceTimersByTimeAsync(2000)
    const stale = await promise

    expect(stale).toEqual(first)
    expect(failMock).toHaveBeenCalledTimes(3)
  })

  it('serves stale cache during cooldown when stale data exists', async () => {
    // Cache a range that includes today (endDate 2026-03-15 >= todayUTC 2026-03-14)
    const successMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse([sampleNeo], '2026-03-15'),
    })
    global.fetch = successMock as typeof fetch

    const first = await fetchNeoFeed('2026-03-14', '2026-03-15')
    expect(first.element_count).toBe(1)

    // Advance past midnight so the cache entry is stale (endDate 2026-03-15 >= todayUTC 2026-03-15)
    jest.setSystemTime(new Date('2026-03-15T01:00:00Z'))

    // Fail the refetch — this puts the key into cooldown and serves stale
    const failMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    })
    global.fetch = failMock as typeof fetch

    const refetchPromise = fetchNeoFeed('2026-03-14', '2026-03-15')
    await jest.advanceTimersByTimeAsync(1000)
    await jest.advanceTimersByTimeAsync(2000)
    const staleResult = await refetchPromise
    expect(staleResult).toEqual(first)

    // Now request again — key is in cooldown, but stale cache should be served
    failMock.mockClear()
    const cooldownResult = await fetchNeoFeed('2026-03-14', '2026-03-15')
    expect(cooldownResult).toEqual(first)
    expect(failMock).toHaveBeenCalledTimes(0)
  })

  it('uses separate cache keys for different date ranges', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse([], '2026-03-10'),
    })

    global.fetch = fetchMock as typeof fetch

    await fetchNeoFeed('2026-03-10', '2026-03-10')
    await fetchNeoFeed('2026-03-11', '2026-03-11')

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('retries when fetch throws a network error and succeeds later', async () => {
    const fetchMock = jest
      .fn()
      .mockRejectedValueOnce(new Error('network error'))
      .mockRejectedValueOnce(new Error('socket hang up'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse([sampleNeo]),
      })

    global.fetch = fetchMock as typeof fetch

    const promise = fetchNeoFeed('2026-03-14', '2026-03-14')
    await jest.advanceTimersByTimeAsync(1000)
    await jest.advanceTimersByTimeAsync(2000)
    const result = await promise

    expect(result.element_count).toBe(1)
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('throws after all network error retries are exhausted', async () => {
    const fetchMock = jest.fn().mockRejectedValue(new Error('network error'))

    global.fetch = fetchMock as typeof fetch

    const promise = fetchNeoFeed('2026-03-14', '2026-03-14').catch((e: Error) => e)
    await jest.advanceTimersByTimeAsync(1000)
    await jest.advanceTimersByTimeAsync(2000)
    const error = await promise

    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toBe('NASA NeoWs API request failed: network error')
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('cleans up failed in-flight request so a new fetch occurs after cooldown', async () => {
    const fetchMock = jest
      .fn()
      .mockRejectedValueOnce(new Error('network error'))
      .mockRejectedValueOnce(new Error('network error'))
      .mockRejectedValueOnce(new Error('network error'))

    global.fetch = fetchMock as typeof fetch

    const firstPromise = fetchNeoFeed('2026-03-10', '2026-03-10').catch((e: Error) => e)
    await jest.advanceTimersByTimeAsync(1000)
    await jest.advanceTimersByTimeAsync(2000)
    await firstPromise

    // After cooldown expires, a new request should try again (not reuse dead promise)
    await jest.advanceTimersByTimeAsync(10 * 60 * 1000)

    const successMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse([sampleNeo], '2026-03-10'),
    })
    global.fetch = successMock as typeof fetch

    const result = await fetchNeoFeed('2026-03-10', '2026-03-10')
    expect(result.element_count).toBe(1)
    expect(successMock).toHaveBeenCalledTimes(1)
  })

  it('retries across mixed failure modes and then succeeds', async () => {
    const fetchMock = jest
      .fn()
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce({ ok: false, status: 503, text: async () => 'Unavailable' })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse([sampleNeo]),
      })

    global.fetch = fetchMock as typeof fetch

    const promise = fetchNeoFeed('2026-03-14', '2026-03-14')
    await jest.advanceTimersByTimeAsync(1000)
    await jest.advanceTimersByTimeAsync(2000)
    const result = await promise

    expect(result.element_count).toBe(1)
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('maps empty feed results without errors', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ element_count: 0, near_earth_objects: {} }),
    })

    global.fetch = fetchMock as typeof fetch

    const result = await fetchNeoFeed('2026-03-14', '2026-03-14')

    expect(result.element_count).toBe(0)
    expect(result.near_earth_objects).toEqual({})
  })

  it('maps multi-date responses correctly', async () => {
    const multiDateResponse = {
      element_count: 2,
      near_earth_objects: {
        '2026-03-10': [sampleNeo],
        '2026-03-11': [{ ...sampleNeo, id: '9999999', name: '(2020 AB)' }],
      },
    }

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => multiDateResponse,
    })

    global.fetch = fetchMock as typeof fetch

    const result = await fetchNeoFeed('2026-03-10', '2026-03-11')

    expect(result.element_count).toBe(2)
    expect(Object.keys(result.near_earth_objects)).toHaveLength(2)
    expect(result.near_earth_objects['2026-03-10']![0]!.id).toBe('3840689')
    expect(result.near_earth_objects['2026-03-11']![0]!.id).toBe('9999999')
  })
})
