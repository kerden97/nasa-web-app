import express from 'express'
import request from 'supertest'
import nasaImageRoutes from '../routes/nasaImage'
import { globalErrorHandler } from '../middleware/errorHandler'
import { searchNasaImages } from '../services/nasaImage'

jest.mock('../services/nasaImage', () => ({
  searchNasaImages: jest.fn(),
}))

const mockedSearch = searchNasaImages as jest.MockedFunction<typeof searchNasaImages>

function createApp() {
  const app = express()
  app.use(nasaImageRoutes)
  app.use(globalErrorHandler)
  return app
}

describe('NASA Image Library controller', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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
          href: 'https://example.com/thumb.jpg',
        },
      ],
      totalHits: 1,
    })

    const response = await request(createApp()).get('/api/nasa-image?q=mars')

    expect(response.status).toBe(200)
    expect(response.body.items).toHaveLength(1)
    expect(response.body.items[0].title).toBe('Mars Surface')
    expect(response.body.totalHits).toBe(1)
    expect(mockedSearch).toHaveBeenCalledWith({ q: 'mars' })
  })

  it('returns 400 when query parameter is missing', async () => {
    const response = await request(createApp()).get('/api/nasa-image')

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('query (q) is required')
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
  })

  it('passes unexpected errors to the global error handler', async () => {
    mockedSearch.mockRejectedValue(new Error('Unexpected failure'))

    const response = await request(createApp()).get('/api/nasa-image?q=mars')

    expect(response.status).toBe(500)
    expect(response.body.error).toBe('Internal server error')
  })

  it('trims the search query before passing to service', async () => {
    mockedSearch.mockResolvedValue({ items: [], totalHits: 0 })

    await request(createApp()).get('/api/nasa-image?q=%20nebula%20')

    expect(mockedSearch).toHaveBeenCalledWith({ q: 'nebula' })
  })
})
