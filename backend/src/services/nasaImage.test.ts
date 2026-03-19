jest.mock('../lib/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}))

describe('NASA Image Library service', () => {
  const originalFetch = global.fetch
  let searchNasaImages: typeof import('./nasaImage').searchNasaImages

  beforeEach(async () => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-03-14T12:00:00Z'))
    jest.resetModules()
    ;({ searchNasaImages } = await import('./nasaImage'))
  })

  afterEach(() => {
    global.fetch = originalFetch
    jest.useRealTimers()
    jest.clearAllMocks()
  })

  const mockApiResponse = (items: unknown[], totalHits: number) => ({
    collection: {
      items: items.map((item: unknown) => {
        const i = item as {
          nasa_id: string
          title: string
          description?: string
          date_created: string
          media_type: string
          center?: string
          keywords?: string[]
          thumbnail?: string
          href?: string
        }
        return {
          href: i.href ?? `https://images-assets.nasa.gov/image/${i.nasa_id}/collection.json`,
          data: [
            {
              nasa_id: i.nasa_id,
              title: i.title,
              description: i.description ?? '',
              date_created: i.date_created,
              media_type: i.media_type,
              center: i.center,
              keywords: i.keywords,
            },
          ],
          links: i.thumbnail ? [{ href: i.thumbnail, rel: 'preview' }] : [],
        }
      }),
      metadata: { total_hits: totalHits },
    },
  })

  it('fetches and maps NASA Image Library results', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () =>
        mockApiResponse(
          [
            {
              nasa_id: 'PIA00001',
              title: 'Mars Surface',
              description: 'Red planet view',
              date_created: '2020-07-30T00:00:00Z',
              media_type: 'image',
              center: 'JPL',
              keywords: ['Mars', 'Surface'],
              thumbnail: 'https://example.com/thumb.jpg',
            },
          ],
          1,
        ),
    })

    global.fetch = fetchMock as typeof fetch

    const result = await searchNasaImages({ q: 'mars' })

    expect(result.items).toHaveLength(1)
    expect(result.items[0]!.nasa_id).toBe('PIA00001')
    expect(result.items[0]!.title).toBe('Mars Surface')
    expect(result.items[0]!.center).toBe('JPL')
    expect(result.items[0]!.keywords).toEqual(['Mars', 'Surface'])
    expect(result.items[0]!.href).toBe('https://example.com/thumb.jpg')
    expect(result.items[0]!.asset_manifest_url).toBe(
      'https://images-assets.nasa.gov/image/PIA00001/collection.json',
    )
    expect(result.totalHits).toBe(1)
    expect(fetchMock).toHaveBeenCalledTimes(1)

    const calledUrl = fetchMock.mock.calls[0]![0] as string
    expect(calledUrl).toContain('q=mars')
    expect(calledUrl).toContain('page=1')
  })

  it('sanitizes HTML and promotional boilerplate from descriptions', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () =>
        mockApiResponse(
          [
            {
              nasa_id: 'PIA00999',
              title: 'Rosebud Galaxy',
              description:
                'Beautiful galaxy core. This NASA/ESA Hubble image shows a merger. Image credit: ESA/Hubble &amp; NASA <b><a href="http://www.nasa.gov/audience/formedia/features/MP_Photo_Guidelines.html">NASA image use policy.</a></b> <b>Follow us on <a href="http://twitter.com/NASAGoddardPix">Twitter</a></b>',
              date_created: '2021-06-15T00:00:00Z',
              media_type: 'image',
              thumbnail: 'https://example.com/thumb.jpg',
            },
          ],
          1,
        ),
    })

    global.fetch = fetchMock as typeof fetch

    const result = await searchNasaImages({ q: 'galaxy' })

    expect(result.items[0]!.description).toBe(
      'Beautiful galaxy core. This NASA/ESA Hubble image shows a merger.',
    )
  })

  it('caches identical search results', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse([], 0),
    })

    global.fetch = fetchMock as typeof fetch

    const first = await searchNasaImages({ q: 'nebula' })
    const second = await searchNasaImages({ q: 'nebula' })

    expect(first).toEqual(second)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('uses separate cache keys for different queries', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse([], 0),
    })

    global.fetch = fetchMock as typeof fetch

    await searchNasaImages({ q: 'mars' })
    await searchNasaImages({ q: 'saturn' })

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('uses separate cache keys for different pages', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse([], 0),
    })

    global.fetch = fetchMock as typeof fetch

    await searchNasaImages({ q: 'mars', page: 1 })
    await searchNasaImages({ q: 'mars', page: 2 })

    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('passes media_type and year params in the URL', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse([], 0),
    })

    global.fetch = fetchMock as typeof fetch

    await searchNasaImages({
      q: 'apollo',
      media_type: 'video',
      year_start: '1969',
      year_end: '1972',
    })

    const calledUrl = fetchMock.mock.calls[0]![0] as string
    expect(calledUrl).toContain('media_type=video')
    expect(calledUrl).toContain('year_start=1969')
    expect(calledUrl).toContain('year_end=1972')
  })

  it('retries transient errors and succeeds on third attempt', async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 500, text: async () => 'Error' })
      .mockResolvedValueOnce({ ok: false, status: 503, text: async () => 'Unavailable' })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse([], 0),
      })

    global.fetch = fetchMock as typeof fetch

    const promise = searchNasaImages({ q: 'retry-test' })
    await jest.advanceTimersByTimeAsync(1000) // 1st retry delay
    await jest.advanceTimersByTimeAsync(2000) // 2nd retry delay
    const result = await promise

    expect(result.items).toHaveLength(0)
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('throws after all retries are exhausted', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: async () => 'Internal Server Error',
    })

    global.fetch = fetchMock as typeof fetch

    const promise = searchNasaImages({ q: 'fail' }).catch((e: Error) => e)
    await jest.advanceTimersByTimeAsync(1000)
    await jest.advanceTimersByTimeAsync(2000)
    const error = await promise

    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toContain('NASA Image Library responded with 500')
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('retries network failures and throws an upstream error after exhaustion', async () => {
    const fetchMock = jest.fn().mockRejectedValue(new Error('socket hang up'))

    global.fetch = fetchMock as typeof fetch

    const promise = searchNasaImages({ q: 'network-fail' }).catch((e: Error) => e)
    await jest.advanceTimersByTimeAsync(1000)
    await jest.advanceTimersByTimeAsync(2000)
    const error = await promise

    expect(error).toBeInstanceOf(Error)
    expect((error as Error).message).toContain('NASA Image Library request failed: socket hang up')
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('does not retry on non-transient errors (e.g. 400)', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () => 'Bad Request',
    })

    global.fetch = fetchMock as typeof fetch

    await expect(searchNasaImages({ q: 'bad' })).rejects.toThrow(
      'NASA Image Library responded with 400',
    )
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('deduplicates concurrent identical requests', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockApiResponse([], 0),
    })

    global.fetch = fetchMock as typeof fetch

    const [first, second] = await Promise.all([
      searchNasaImages({ q: 'dedup' }),
      searchNasaImages({ q: 'dedup' }),
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

    // First call fails after retries
    const firstAttempt = searchNasaImages({ q: 'cooldown' }).catch((e: Error) => e)
    await jest.advanceTimersByTimeAsync(1000)
    await jest.advanceTimersByTimeAsync(2000)
    await firstAttempt

    fetchMock.mockClear()

    // Immediate retry is blocked by cooldown — no fetch calls
    await expect(searchNasaImages({ q: 'cooldown' })).rejects.toThrow(
      'NASA Image Library responded with 500',
    )
    expect(fetchMock).toHaveBeenCalledTimes(0)
  })

  it('filters out items with no data entries', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        collection: {
          items: [
            { data: [], links: [] },
            {
              href: 'https://images-assets.nasa.gov/image/PIA00002/collection.json',
              data: [
                {
                  nasa_id: 'PIA00002',
                  title: 'Valid Item',
                  date_created: '2021-01-01T00:00:00Z',
                  media_type: 'image',
                },
              ],
              links: [{ href: 'https://example.com/thumb2.jpg', rel: 'preview' }],
            },
          ],
          metadata: { total_hits: 2 },
        },
      }),
    })

    global.fetch = fetchMock as typeof fetch

    const result = await searchNasaImages({ q: 'test' })

    expect(result.items).toHaveLength(1)
    expect(result.items[0]!.nasa_id).toBe('PIA00002')
  })

  it('handles items without preview links gracefully', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () =>
        mockApiResponse(
          [
            {
              nasa_id: 'PIA00003',
              title: 'No Thumbnail',
              date_created: '2021-06-15T00:00:00Z',
              media_type: 'video',
            },
          ],
          1,
        ),
    })

    global.fetch = fetchMock as typeof fetch

    const result = await searchNasaImages({ q: 'test' })

    expect(result.items[0]!.href).toBe('')
  })
})
