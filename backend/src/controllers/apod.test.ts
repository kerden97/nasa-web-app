import express from 'express'
import request from 'supertest'
import apodRoutes from '../routes/apod'
import { globalErrorHandler } from '../middleware/errorHandler'
import { fetchApod } from '../services/apod'
import { getOptimizedApodImage } from '../services/apodImageProxy'

jest.mock('../services/apod', () => ({
  fetchApod: jest.fn(),
}))

jest.mock('../services/apodImageProxy', () => ({
  getOptimizedApodImage: jest.fn(),
  isOptimizableApodImageSource: jest.fn(() => true),
  normalizeApodImageWidth: jest.fn(
    (value: number | undefined, fallback: number) => value ?? fallback,
  ),
  normalizeApodImageQuality: jest.fn(
    (value: number | undefined, fallback: number) => value ?? fallback,
  ),
}))

const mockedFetchApod = fetchApod as jest.MockedFunction<typeof fetchApod>
const mockedGetOptimizedApodImage = getOptimizedApodImage as jest.MockedFunction<
  typeof getOptimizedApodImage
>

function createApp() {
  const app = express()
  app.use(apodRoutes)
  app.use(globalErrorHandler)
  return app
}

describe('APOD controller', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns APOD data for a valid request', async () => {
    mockedFetchApod.mockResolvedValue({
      date: '2026-03-11',
      title: 'CG 4',
      explanation: 'Cosmic cloud',
      url: 'https://example.com/image.jpg',
      media_type: 'image',
      service_version: 'v1',
    })

    const response = await request(createApp()).get('/api/apod?date=2026-03-11')

    expect(response.status).toBe(200)
    expect(response.body.title).toBe('CG 4')
    expect(mockedFetchApod).toHaveBeenCalledWith({ date: '2026-03-11' })
  })

  it('adds optimized image URLs for APOD image responses', async () => {
    mockedFetchApod.mockResolvedValue({
      date: '2026-03-11',
      title: 'CG 4',
      explanation: 'Cosmic cloud',
      url: 'https://apod.nasa.gov/apod/image/2603/cg4.jpg',
      media_type: 'image',
      service_version: 'v1',
    })

    const response = await request(createApp()).get('/api/apod?date=2026-03-11')

    expect(response.status).toBe(200)
    expect(response.body.hero_url).toContain('/api/apod/image?')
    expect(response.body.card_url).toContain('/api/apod/image?')
  })

  it('returns 400 for an invalid date', async () => {
    const response = await request(createApp()).get('/api/apod?date=11-03-2026')

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('Invalid date format')
    expect(response.body.code).toBe('invalid_date')
    expect(response.body.status).toBe(400)
    expect(mockedFetchApod).not.toHaveBeenCalled()
  })

  it('returns 400 for an invalid start_date', async () => {
    const response = await request(createApp()).get('/api/apod?start_date=2026/03/01')

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('Invalid start_date format')
    expect(mockedFetchApod).not.toHaveBeenCalled()
  })

  it('passes a valid count to fetchApod', async () => {
    mockedFetchApod.mockResolvedValue([])

    const response = await request(createApp()).get('/api/apod?count=21')

    expect(response.status).toBe(200)
    expect(mockedFetchApod).toHaveBeenCalledWith({ count: 21 })
  })

  it('returns 400 for count=0', async () => {
    const response = await request(createApp()).get('/api/apod?count=0')

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('count must be between 1 and 100')
    expect(mockedFetchApod).not.toHaveBeenCalled()
  })

  it('returns 400 for count=101', async () => {
    const response = await request(createApp()).get('/api/apod?count=101')

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('count must be between 1 and 100')
    expect(mockedFetchApod).not.toHaveBeenCalled()
  })

  it('returns 400 for non-numeric count', async () => {
    const response = await request(createApp()).get('/api/apod?count=abc')

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('count must be between 1 and 100')
    expect(mockedFetchApod).not.toHaveBeenCalled()
  })

  it('passes count with end_date for load-more requests', async () => {
    mockedFetchApod.mockResolvedValue([])

    const response = await request(createApp()).get('/api/apod?end_date=2026-03-01&count=20')

    expect(response.status).toBe(200)
    expect(mockedFetchApod).toHaveBeenCalledWith({
      end_date: '2026-03-01',
      count: 20,
    })
  })

  it('returns 400 for an invalid end_date', async () => {
    const response = await request(createApp()).get('/api/apod?end_date=2026/03/99')

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('Invalid end_date format')
    expect(mockedFetchApod).not.toHaveBeenCalled()
  })

  it('returns 400 for an impossible calendar date', async () => {
    const response = await request(createApp()).get('/api/apod?date=2026-02-31')

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('Invalid date format')
    expect(mockedFetchApod).not.toHaveBeenCalled()
  })

  it('returns 502 when the NASA service fails', async () => {
    mockedFetchApod.mockRejectedValue(new Error('NASA API responded with 500'))

    const response = await request(createApp()).get('/api/apod?date=2026-03-11')

    expect(response.status).toBe(502)
    expect(response.body.error).toContain("NASA's API is temporarily unavailable")
    expect(response.body.code).toBe('upstream_service_unavailable')
    expect(response.body.status).toBe(502)
  })

  it('returns 502 when the NASA request fails at the network layer', async () => {
    mockedFetchApod.mockRejectedValue(new Error('NASA API request failed: socket hang up'))

    const response = await request(createApp()).get('/api/apod?date=2026-03-11')

    expect(response.status).toBe(502)
    expect(response.body.error).toContain("NASA's API is temporarily unavailable")
    expect(response.body.code).toBe('upstream_service_unavailable')
    expect(response.body.status).toBe(502)
  })

  it('passes unexpected errors to the global error handler', async () => {
    mockedFetchApod.mockRejectedValue(new Error('Unexpected failure'))

    const response = await request(createApp()).get('/api/apod?date=2026-03-11')

    expect(response.status).toBe(500)
    expect(response.body.error).toBe('Internal server error')
    expect(response.body.code).toBe('internal_server_error')
    expect(response.body.status).toBe(500)
  })

  it('returns 400 when date is combined with other params', async () => {
    const response = await request(createApp()).get('/api/apod?date=2026-03-11&count=10')

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('date cannot be combined')
    expect(mockedFetchApod).not.toHaveBeenCalled()
  })

  it('returns 400 for partially numeric count', async () => {
    const response = await request(createApp()).get('/api/apod?count=10abc')

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('count must be between 1 and 100')
    expect(mockedFetchApod).not.toHaveBeenCalled()
  })

  it('returns 400 for decimal count', async () => {
    const response = await request(createApp()).get('/api/apod?count=20.5')

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('count must be between 1 and 100')
    expect(mockedFetchApod).not.toHaveBeenCalled()
  })

  it('passes start_date and end_date for a valid range request', async () => {
    mockedFetchApod.mockResolvedValue([])

    const response = await request(createApp()).get(
      '/api/apod?start_date=2026-03-01&end_date=2026-03-05',
    )

    expect(response.status).toBe(200)
    expect(mockedFetchApod).toHaveBeenCalledWith({
      start_date: '2026-03-01',
      end_date: '2026-03-05',
    })
  })

  it('returns 400 when start_date is later than end_date', async () => {
    const response = await request(createApp()).get(
      '/api/apod?start_date=2026-03-15&end_date=2026-03-01',
    )

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('start_date cannot be later than end_date')
    expect(mockedFetchApod).not.toHaveBeenCalled()
  })

  it('returns optimized APOD image assets for valid proxy requests', async () => {
    mockedGetOptimizedApodImage.mockResolvedValue({
      buffer: Buffer.from('optimized-image'),
      contentType: 'image/webp',
      etag: 'asset-tag',
    })

    const response = await request(createApp()).get('/api/apod/image').query({
      src: 'https://apod.nasa.gov/apod/image/2603/cg4.jpg',
      w: '640',
      q: '68',
    })

    expect(response.status).toBe(200)
    expect(response.headers['content-type']).toContain('image/webp')
    expect(response.headers['cache-control']).toContain('immutable')
    expect(mockedGetOptimizedApodImage).toHaveBeenCalledWith(
      'https://apod.nasa.gov/apod/image/2603/cg4.jpg',
      640,
      68,
    )
  })
})
