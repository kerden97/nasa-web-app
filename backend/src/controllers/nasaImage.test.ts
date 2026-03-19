import express from 'express'
import request from 'supertest'
import nasaImageRoutes from '../routes/nasaImage'
import { globalErrorHandler } from '../middleware/errorHandler'
import { searchNasaImages } from '../services/nasaImage'
import { getOptimizedNasaImage } from '../services/nasaImageProxy'

jest.mock('../services/nasaImage', () => ({
  searchNasaImages: jest.fn(),
}))

jest.mock('../services/nasaImageProxy', () => ({
  getOptimizedNasaImage: jest.fn(),
  isOptimizableNasaImageSource: (sourceUrl: string | undefined) =>
    typeof sourceUrl === 'string' && sourceUrl.startsWith('https://images-assets.nasa.gov/'),
  normalizeNasaImageWidth: (width: number | undefined, fallback: number) => width ?? fallback,
  normalizeNasaImageQuality: (quality: number | undefined, fallback: number) => quality ?? fallback,
}))

const mockedSearch = searchNasaImages as jest.MockedFunction<typeof searchNasaImages>
const mockedGetOptimizedNasaImage = getOptimizedNasaImage as jest.MockedFunction<
  typeof getOptimizedNasaImage
>

function createApp() {
  const app = express()
  app.use(nasaImageRoutes)
  app.use(globalErrorHandler)
  return app
}

describe('NASA Image Library controller', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedGetOptimizedNasaImage.mockReset()
  })

  it('returns results for a valid search query', async () => {
    mockedSearch.mockResolvedValue({
      items: [
        {
          nasa_id: 'PIA00001',
          title: 'Mars Surface',
          description: 'A view of the Mars surface.',
          date_created: '2020-07-30T00:00:00Z',
          media_type: 'image',
          href: 'https://images-assets.nasa.gov/image/PIA00001/PIA00001~thumb.jpg',
        },
      ],
      totalHits: 1,
    })

    const response = await request(createApp()).get('/api/nasa-image?q=mars')

    expect(response.status).toBe(200)
    expect(response.body.items).toHaveLength(1)
    expect(response.body.items[0].title).toBe('Mars Surface')
    expect(response.body.totalHits).toBe(1)
    expect(response.body.items[0].card_url).toContain('/api/nasa-image/image?')
    expect(mockedSearch).toHaveBeenCalledWith({ q: 'mars' })
  })

  it('returns 400 when query parameter is missing', async () => {
    const response = await request(createApp()).get('/api/nasa-image')

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('query (q) is required')
    expect(response.body.code).toBe('missing_query')
    expect(response.body.status).toBe(400)
    expect(mockedSearch).not.toHaveBeenCalled()
  })

  it('returns 400 when query is empty', async () => {
    const response = await request(createApp()).get('/api/nasa-image?q=')

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('query (q) is required')
    expect(mockedSearch).not.toHaveBeenCalled()
  })

  it('returns 400 when query is whitespace only', async () => {
    const response = await request(createApp()).get('/api/nasa-image?q=%20%20')

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('query (q) is required')
    expect(mockedSearch).not.toHaveBeenCalled()
  })

  it('returns 400 when query exceeds 200 characters', async () => {
    const longQuery = 'a'.repeat(201)
    const response = await request(createApp()).get(`/api/nasa-image?q=${longQuery}`)

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('under 200 characters')
    expect(mockedSearch).not.toHaveBeenCalled()
  })

  it('passes media_type filter to service', async () => {
    mockedSearch.mockResolvedValue({ items: [], totalHits: 0 })

    const response = await request(createApp()).get('/api/nasa-image?q=nebula&media_type=video')

    expect(response.status).toBe(200)
    expect(mockedSearch).toHaveBeenCalledWith({ q: 'nebula', media_type: 'video' })
  })

  it('returns 400 for invalid media_type', async () => {
    const response = await request(createApp()).get('/api/nasa-image?q=test&media_type=gif')

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('media_type must be one of')
    expect(mockedSearch).not.toHaveBeenCalled()
  })

  it('passes year_start and year_end to service', async () => {
    mockedSearch.mockResolvedValue({ items: [], totalHits: 0 })

    const response = await request(createApp()).get(
      '/api/nasa-image?q=apollo&year_start=1969&year_end=1972',
    )

    expect(response.status).toBe(200)
    expect(mockedSearch).toHaveBeenCalledWith({
      q: 'apollo',
      year_start: '1969',
      year_end: '1972',
    })
  })

  it('returns 400 when year_start is later than year_end', async () => {
    const response = await request(createApp()).get(
      '/api/nasa-image?q=apollo&year_start=2020&year_end=1969',
    )

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('year_start cannot be later than year_end')
    expect(mockedSearch).not.toHaveBeenCalled()
  })

  it('passes all valid filters to the service', async () => {
    mockedSearch.mockResolvedValue({ items: [], totalHits: 0 })

    const response = await request(createApp()).get(
      '/api/nasa-image?q=apollo&media_type=image&year_start=1969&year_end=1972&page=2',
    )

    expect(response.status).toBe(200)
    expect(mockedSearch).toHaveBeenCalledWith({
      q: 'apollo',
      media_type: 'image',
      year_start: '1969',
      year_end: '1972',
      page: 2,
    })
  })

  it('returns 400 for invalid year_start', async () => {
    const response = await request(createApp()).get('/api/nasa-image?q=test&year_start=abc')

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('year_start must be a valid four-digit year')
    expect(mockedSearch).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid year_end', async () => {
    const response = await request(createApp()).get('/api/nasa-image?q=test&year_end=99')

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('year_end must be a valid four-digit year')
    expect(mockedSearch).not.toHaveBeenCalled()
  })

  it('passes page parameter to service', async () => {
    mockedSearch.mockResolvedValue({ items: [], totalHits: 0 })

    const response = await request(createApp()).get('/api/nasa-image?q=saturn&page=3')

    expect(response.status).toBe(200)
    expect(mockedSearch).toHaveBeenCalledWith({ q: 'saturn', page: 3 })
  })

  it('returns 400 for non-numeric page', async () => {
    const response = await request(createApp()).get('/api/nasa-image?q=test&page=abc')

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('page must be a positive integer')
    expect(mockedSearch).not.toHaveBeenCalled()
  })

  it('returns 400 for page=0', async () => {
    const response = await request(createApp()).get('/api/nasa-image?q=test&page=0')

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('page must be a positive integer')
    expect(mockedSearch).not.toHaveBeenCalled()
  })

  it('returns 502 when NASA Image Library service fails', async () => {
    mockedSearch.mockRejectedValue(new Error('NASA Image Library responded with 500'))

    const response = await request(createApp()).get('/api/nasa-image?q=mars')

    expect(response.status).toBe(502)
    expect(response.body.error).toContain('temporarily unavailable')
    expect(response.body.code).toBe('upstream_service_unavailable')
    expect(response.body.status).toBe(502)
  })

  it('returns 502 when the NASA Image Library request fails at the network layer', async () => {
    mockedSearch.mockRejectedValue(new Error('NASA Image Library request failed: socket hang up'))

    const response = await request(createApp()).get('/api/nasa-image?q=mars')

    expect(response.status).toBe(502)
    expect(response.body.error).toContain('temporarily unavailable')
    expect(response.body.code).toBe('upstream_service_unavailable')
    expect(response.body.status).toBe(502)
  })

  it('passes unexpected errors to the global error handler', async () => {
    mockedSearch.mockRejectedValue(new Error('Unexpected failure'))

    const response = await request(createApp()).get('/api/nasa-image?q=mars')

    expect(response.status).toBe(500)
    expect(response.body.error).toBe('Internal server error')
    expect(response.body.code).toBe('internal_server_error')
    expect(response.body.status).toBe(500)
  })

  it('trims the search query before passing to service', async () => {
    mockedSearch.mockResolvedValue({ items: [], totalHits: 0 })

    await request(createApp()).get('/api/nasa-image?q=%20nebula%20')

    expect(mockedSearch).toHaveBeenCalledWith({ q: 'nebula' })
  })

  it('returns an optimized preview image asset', async () => {
    mockedGetOptimizedNasaImage.mockResolvedValue({
      buffer: Buffer.from('nasa-image'),
      contentType: 'image/webp',
      etag: 'nasa-etag',
    })

    const response = await request(createApp()).get(
      '/api/nasa-image/image?src=https%3A%2F%2Fimages-assets.nasa.gov%2Fimage%2FPIA23123%2FPIA23123~thumb.jpg&w=640&q=72',
    )

    expect(response.status).toBe(200)
    expect(response.header['content-type']).toContain('image/webp')
    expect(response.header.etag).toBe('nasa-etag')
    expect(mockedGetOptimizedNasaImage).toHaveBeenCalledWith(
      'https://images-assets.nasa.gov/image/PIA23123/PIA23123~thumb.jpg',
      640,
      72,
    )
  })

  it('returns 400 for unsupported preview image sources', async () => {
    mockedGetOptimizedNasaImage.mockRejectedValue(
      new Error('Unsupported NASA Image Library image source'),
    )

    const response = await request(createApp()).get(
      '/api/nasa-image/image?src=https%3A%2F%2Fexample.com%2Fthumb.jpg',
    )

    expect(response.status).toBe(400)
    expect(response.body.code).toBe('unsupported_image_source')
    expect(mockedGetOptimizedNasaImage).toHaveBeenCalledWith(
      'https://example.com/thumb.jpg',
      640,
      72,
    )
  })
})
