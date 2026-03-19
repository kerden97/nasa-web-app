import express from 'express'
import request from 'supertest'
import epicRoutes from '../routes/epic'
import { globalErrorHandler } from '../middleware/errorHandler'
import { fetchEpicImages, fetchEpicDates } from '../services/epic'
import { getOptimizedEpicImage } from '../services/epicImageProxy'

jest.mock('../services/epic', () => ({
  fetchEpicImages: jest.fn(),
  fetchEpicDates: jest.fn(),
}))

jest.mock('../services/epicImageProxy', () => ({
  getOptimizedEpicImage: jest.fn(),
  isOptimizableEpicImageSource: (sourceUrl: string | undefined) =>
    typeof sourceUrl === 'string' && sourceUrl.startsWith('https://epic.gsfc.nasa.gov/archive/'),
  normalizeEpicImageWidth: (width: number | undefined, fallback: number) => width ?? fallback,
  normalizeEpicImageQuality: (quality: number | undefined, fallback: number) => quality ?? fallback,
}))

const mockedFetchImages = fetchEpicImages as jest.MockedFunction<typeof fetchEpicImages>
const mockedFetchDates = fetchEpicDates as jest.MockedFunction<typeof fetchEpicDates>
const mockedGetOptimizedEpicImage = getOptimizedEpicImage as jest.MockedFunction<
  typeof getOptimizedEpicImage
>

function createApp() {
  const app = express()
  app.use(epicRoutes)
  app.use(globalErrorHandler)
  return app
}

beforeEach(() => {
  jest.clearAllMocks()
  mockedGetOptimizedEpicImage.mockReset()
})

describe('EPIC controller – getEpicImages', () => {
  it('returns EPIC images with default natural collection', async () => {
    const images = [
      {
        identifier: '20260312003633',
        caption: 'Earth from DSCOVR',
        image:
          'https://epic.gsfc.nasa.gov/archive/natural/2026/03/12/jpg/epic_1b_20260312003633.jpg',
        date: '2026-03-12 00:36:33',
        centroid_coordinates: { lat: 12.5, lon: -45.2 },
      },
    ]
    mockedFetchImages.mockResolvedValue(images)

    const response = await request(createApp()).get('/api/epic')

    expect(response.status).toBe(200)
    expect(response.body).toHaveLength(1)
    expect(response.body[0].identifier).toBe('20260312003633')
    expect(response.body[0].card_url).toContain('/api/epic/image?')
    expect(mockedFetchImages).toHaveBeenCalledWith('natural', undefined)
  })

  it('passes collection and date parameters to service', async () => {
    mockedFetchImages.mockResolvedValue([])

    const response = await request(createApp()).get('/api/epic?collection=enhanced&date=2026-03-10')

    expect(response.status).toBe(200)
    expect(mockedFetchImages).toHaveBeenCalledWith('enhanced', '2026-03-10')
  })

  it('defaults to natural for invalid collection', async () => {
    mockedFetchImages.mockResolvedValue([])

    const response = await request(createApp()).get('/api/epic?collection=infrared')

    expect(response.status).toBe(200)
    expect(mockedFetchImages).toHaveBeenCalledWith('natural', undefined)
  })

  it('defaults invalid collection to natural even when date is provided', async () => {
    mockedFetchImages.mockResolvedValue([])

    const response = await request(createApp()).get('/api/epic?collection=fake&date=2026-03-10')

    expect(response.status).toBe(200)
    expect(mockedFetchImages).toHaveBeenCalledWith('natural', '2026-03-10')
  })

  it('returns 400 for invalid date format', async () => {
    const response = await request(createApp()).get('/api/epic?date=12-03-2026')

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('Invalid date format')
    expect(response.body.code).toBe('invalid_date')
    expect(response.body.status).toBe(400)
    expect(mockedFetchImages).not.toHaveBeenCalled()
  })

  it('returns 400 for date with extra characters', async () => {
    const response = await request(createApp()).get('/api/epic?date=2026-03-10T00:00')

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('Invalid date format')
    expect(mockedFetchImages).not.toHaveBeenCalled()
  })

  it('returns 400 for an impossible calendar date', async () => {
    const response = await request(createApp()).get('/api/epic?date=2026-02-31')

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('Invalid date format')
    expect(mockedFetchImages).not.toHaveBeenCalled()
  })

  it('returns 502 when NASA EPIC service fails', async () => {
    mockedFetchImages.mockRejectedValue(new Error('NASA EPIC API responded with 500'))

    const response = await request(createApp()).get('/api/epic')

    expect(response.status).toBe(502)
    expect(response.body.error).toContain('temporarily unavailable')
    expect(response.body.code).toBe('upstream_service_unavailable')
    expect(response.body.status).toBe(502)
  })

  it('passes unexpected errors to the global error handler', async () => {
    mockedFetchImages.mockRejectedValue(new Error('Unexpected failure'))

    const response = await request(createApp()).get('/api/epic')

    expect(response.status).toBe(500)
    expect(response.body.error).toBe('Internal server error')
    expect(response.body.code).toBe('internal_server_error')
    expect(response.body.status).toBe(500)
  })
})

describe('EPIC controller – getEpicDates', () => {
  it('returns available dates for natural collection', async () => {
    const dates = ['2026-03-12', '2026-03-11', '2026-03-10']
    mockedFetchDates.mockResolvedValue(dates)

    const response = await request(createApp()).get('/api/epic/dates')

    expect(response.status).toBe(200)
    expect(response.body).toEqual(dates)
    expect(mockedFetchDates).toHaveBeenCalledWith('natural')
  })

  it('passes enhanced collection for dates', async () => {
    mockedFetchDates.mockResolvedValue([])

    const response = await request(createApp()).get('/api/epic/dates?collection=enhanced')

    expect(response.status).toBe(200)
    expect(mockedFetchDates).toHaveBeenCalledWith('enhanced')
  })

  it('defaults to natural for invalid collection', async () => {
    mockedFetchDates.mockResolvedValue([])

    const response = await request(createApp()).get('/api/epic/dates?collection=fake')

    expect(response.status).toBe(200)
    expect(mockedFetchDates).toHaveBeenCalledWith('natural')
  })

  it('returns 502 when NASA EPIC dates service fails', async () => {
    mockedFetchDates.mockRejectedValue(new Error('NASA EPIC API responded with 500'))

    const response = await request(createApp()).get('/api/epic/dates')

    expect(response.status).toBe(502)
    expect(response.body.error).toContain('temporarily unavailable')
  })

  it('passes unexpected errors to the global error handler', async () => {
    mockedFetchDates.mockRejectedValue(new Error('Unexpected failure'))

    const response = await request(createApp()).get('/api/epic/dates')

    expect(response.status).toBe(500)
    expect(response.body.error).toBe('Internal server error')
  })
})

describe('EPIC controller – getEpicImage', () => {
  it('returns an optimized image asset', async () => {
    mockedGetOptimizedEpicImage.mockResolvedValue({
      buffer: Buffer.from('epic-image'),
      contentType: 'image/webp',
      etag: 'epic-etag',
    })

    const response = await request(createApp()).get(
      '/api/epic/image?src=https%3A%2F%2Fepic.gsfc.nasa.gov%2Farchive%2Fnatural%2F2026%2F03%2F12%2Fjpg%2Fepic.jpg&w=640&q=70',
    )

    expect(response.status).toBe(200)
    expect(response.header['content-type']).toContain('image/webp')
    expect(response.header.etag).toBe('epic-etag')
    expect(mockedGetOptimizedEpicImage).toHaveBeenCalledWith(
      'https://epic.gsfc.nasa.gov/archive/natural/2026/03/12/jpg/epic.jpg',
      640,
      70,
    )
  })

  it('returns 304 when the etag matches', async () => {
    mockedGetOptimizedEpicImage.mockResolvedValue({
      buffer: Buffer.from('epic-image'),
      contentType: 'image/webp',
      etag: 'epic-etag',
    })

    const response = await request(createApp())
      .get(
        '/api/epic/image?src=https%3A%2F%2Fepic.gsfc.nasa.gov%2Farchive%2Fnatural%2F2026%2F03%2F12%2Fjpg%2Fepic.jpg',
      )
      .set('If-None-Match', 'epic-etag')

    expect(response.status).toBe(304)
  })

  it('returns 400 for unsupported image hosts', async () => {
    mockedGetOptimizedEpicImage.mockRejectedValue(new Error('Unsupported EPIC image source'))

    const response = await request(createApp()).get(
      '/api/epic/image?src=https%3A%2F%2Fexample.com%2Fepic.jpg',
    )

    expect(response.status).toBe(400)
    expect(response.body.code).toBe('unsupported_image_source')
    expect(mockedGetOptimizedEpicImage).toHaveBeenCalledWith(
      'https://example.com/epic.jpg',
      640,
      70,
    )
  })
})
