import express from 'express'
import request from 'supertest'
import neowsRoutes from '../routes/neows'
import { globalErrorHandler } from '../middleware/errorHandler'
import { fetchNeoFeed } from '../services/neows'

jest.mock('../services/neows', () => ({
  fetchNeoFeed: jest.fn(),
}))

const mockedFetchNeoFeed = fetchNeoFeed as jest.MockedFunction<typeof fetchNeoFeed>

function createApp() {
  const app = express()
  app.use(neowsRoutes)
  app.use(globalErrorHandler)
  return app
}

const mockFeedResult = {
  element_count: 1,
  near_earth_objects: {
    '2026-03-14': [
      {
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
      },
    ],
  },
}

describe('NeoWs controller', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns feed data for a valid date range', async () => {
    mockedFetchNeoFeed.mockResolvedValue(mockFeedResult)

    const response = await request(createApp()).get(
      '/api/neows/feed?start_date=2026-03-14&end_date=2026-03-14',
    )

    expect(response.status).toBe(200)
    expect(response.body.element_count).toBe(1)
    expect(response.body.near_earth_objects['2026-03-14']).toHaveLength(1)
    expect(mockedFetchNeoFeed).toHaveBeenCalledWith('2026-03-14', '2026-03-14')
  })

  it('returns 400 when start_date is missing', async () => {
    const response = await request(createApp()).get('/api/neows/feed?end_date=2026-03-14')

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('start_date')
    expect(response.body.code).toBe('invalid_start_date')
    expect(response.body.status).toBe(400)
    expect(mockedFetchNeoFeed).not.toHaveBeenCalled()
  })

  it('returns 400 when end_date is missing', async () => {
    const response = await request(createApp()).get('/api/neows/feed?start_date=2026-03-14')

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('end_date')
    expect(mockedFetchNeoFeed).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid start_date format', async () => {
    const response = await request(createApp()).get(
      '/api/neows/feed?start_date=14-03-2026&end_date=2026-03-14',
    )

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('start_date')
    expect(mockedFetchNeoFeed).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid end_date format', async () => {
    const response = await request(createApp()).get(
      '/api/neows/feed?start_date=2026-03-14&end_date=2026/03/14',
    )

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('end_date')
    expect(mockedFetchNeoFeed).not.toHaveBeenCalled()
  })

  it('returns 400 for impossible start_date', async () => {
    const response = await request(createApp()).get(
      '/api/neows/feed?start_date=2026-02-31&end_date=2026-03-14',
    )

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('start_date')
    expect(mockedFetchNeoFeed).not.toHaveBeenCalled()
  })

  it('returns 400 for impossible end_date', async () => {
    const response = await request(createApp()).get(
      '/api/neows/feed?start_date=2026-03-14&end_date=2026-02-31',
    )

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('end_date')
    expect(mockedFetchNeoFeed).not.toHaveBeenCalled()
  })

  it('returns 400 when start_date is after end_date', async () => {
    const response = await request(createApp()).get(
      '/api/neows/feed?start_date=2026-03-20&end_date=2026-03-14',
    )

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('before or equal')
    expect(mockedFetchNeoFeed).not.toHaveBeenCalled()
  })

  it('returns 400 when date range exceeds 7 days', async () => {
    const response = await request(createApp()).get(
      '/api/neows/feed?start_date=2026-03-01&end_date=2026-03-15',
    )

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('7 days')
    expect(mockedFetchNeoFeed).not.toHaveBeenCalled()
  })

  it('accepts a full 7-day range', async () => {
    mockedFetchNeoFeed.mockResolvedValue({ element_count: 0, near_earth_objects: {} })

    const response = await request(createApp()).get(
      '/api/neows/feed?start_date=2026-03-09&end_date=2026-03-15',
    )

    expect(response.status).toBe(200)
    expect(mockedFetchNeoFeed).toHaveBeenCalledWith('2026-03-09', '2026-03-15')
  })

  it('rejects an 8-day inclusive range', async () => {
    const response = await request(createApp()).get(
      '/api/neows/feed?start_date=2026-03-08&end_date=2026-03-15',
    )

    expect(response.status).toBe(400)
    expect(response.body.error).toContain('7 days')
    expect(mockedFetchNeoFeed).not.toHaveBeenCalled()
  })

  it('returns 502 when NASA NeoWs service fails', async () => {
    mockedFetchNeoFeed.mockRejectedValue(new Error('NASA NeoWs API responded with 500'))

    const response = await request(createApp()).get(
      '/api/neows/feed?start_date=2026-03-14&end_date=2026-03-14',
    )

    expect(response.status).toBe(502)
    expect(response.body.error).toContain('temporarily unavailable')
    expect(response.body.code).toBe('upstream_service_unavailable')
    expect(response.body.status).toBe(502)
  })

  it('passes unexpected errors to the global error handler', async () => {
    mockedFetchNeoFeed.mockRejectedValue(new Error('Unexpected failure'))

    const response = await request(createApp()).get(
      '/api/neows/feed?start_date=2026-03-14&end_date=2026-03-14',
    )

    expect(response.status).toBe(500)
    expect(response.body.error).toBe('Internal server error')
    expect(response.body.code).toBe('internal_server_error')
    expect(response.body.status).toBe(500)
  })
})
