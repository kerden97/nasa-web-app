import express from 'express'
import request from 'supertest'
import neowsRoutes from '../routes/neows'
import { globalErrorHandler } from '../middleware/errorHandler'
import { fetchNeoRadarBrief } from '../services/neowsRadarBrief'
import type { NeoRadarBriefResponse } from '../types/neowsRadarBrief'

jest.mock('../services/neowsRadarBrief', () => ({
  fetchNeoRadarBrief: jest.fn(),
}))

const mockedFetchNeoRadarBrief = fetchNeoRadarBrief as jest.MockedFunction<
  typeof fetchNeoRadarBrief
>

function createApp() {
  const app = express()
  app.use(neowsRoutes)
  app.use(globalErrorHandler)
  return app
}

describe('NeoWs radar brief controller', () => {
  const radarBriefFixture: NeoRadarBriefResponse = {
    source: 'ai',
    model: 'gpt-4o-mini',
    generatedAt: '2026-03-14T12:00:00.000Z',
    startDate: '2026-03-14',
    endDate: '2026-03-14',
    headline: 'Radar headline',
    overview: 'Overview',
    impactScenario: 'Scenario',
    watchNotes: ['A', 'B', 'C'],
    disclaimer: 'Disclaimer',
    factsUsed: {
      totalObjects: 1,
      hazardousCount: 0,
      observationDays: 1,
      busiestDay: {
        date: '2026-03-14',
        count: 1,
        hazardousCount: 0,
      },
      closestApproach: {
        id: '1',
        name: '2026 AB',
        date: '2026-03-14',
        hazardous: false,
        diameterMeters: 42,
        velocityKmS: 18.4,
        missDistanceLd: 4.2,
        nasaJplUrl: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=1',
      },
      fastestObject: {
        id: '1',
        name: '2026 AB',
        date: '2026-03-14',
        hazardous: false,
        diameterMeters: 42,
        velocityKmS: 18.4,
        missDistanceLd: 4.2,
        nasaJplUrl: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=1',
      },
      largestObject: {
        id: '1',
        name: '2026 AB',
        date: '2026-03-14',
        hazardous: false,
        diameterMeters: 42,
        velocityKmS: 18.4,
        missDistanceLd: 4.2,
        nasaJplUrl: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=1',
      },
      largestHazardousObject: null,
      impactSubject: {
        id: '1',
        name: '2026 AB',
        date: '2026-03-14',
        hazardous: false,
        diameterMeters: 42,
        velocityKmS: 18.4,
        missDistanceLd: 4.2,
        nasaJplUrl: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=1',
      },
      impactComparison: 'about the size of a house',
      impactBand: 'a city-scale destructive event',
      illustrativeEnergyMegatons: 12,
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns a radar brief for a valid date range', async () => {
    mockedFetchNeoRadarBrief.mockResolvedValue(radarBriefFixture)

    const response = await request(createApp()).get(
      '/api/neows/radar-brief?start_date=2026-03-14&end_date=2026-03-14',
    )

    expect(response.status).toBe(200)
    expect(response.body.headline).toBe('Radar headline')
    expect(mockedFetchNeoRadarBrief).toHaveBeenCalledWith('2026-03-14', '2026-03-14')
  })

  it('returns 400 when start_date is missing', async () => {
    const response = await request(createApp()).get('/api/neows/radar-brief?end_date=2026-03-14')

    expect(response.status).toBe(400)
    expect(response.body.code).toBe('invalid_start_date')
    expect(response.body.error).toContain('start_date')
    expect(mockedFetchNeoRadarBrief).not.toHaveBeenCalled()
  })

  it('returns 400 when end_date is missing', async () => {
    const response = await request(createApp()).get('/api/neows/radar-brief?start_date=2026-03-14')

    expect(response.status).toBe(400)
    expect(response.body.code).toBe('invalid_end_date')
    expect(response.body.error).toContain('end_date')
    expect(mockedFetchNeoRadarBrief).not.toHaveBeenCalled()
  })

  it('returns 400 when start_date is after end_date', async () => {
    const response = await request(createApp()).get(
      '/api/neows/radar-brief?start_date=2026-03-20&end_date=2026-03-14',
    )

    expect(response.status).toBe(400)
    expect(response.body.code).toBe('invalid_date_range')
    expect(response.body.error).toContain('before or equal')
    expect(mockedFetchNeoRadarBrief).not.toHaveBeenCalled()
  })

  it('returns 400 when date range exceeds 7 days', async () => {
    const response = await request(createApp()).get(
      '/api/neows/radar-brief?start_date=2026-03-01&end_date=2026-03-15',
    )

    expect(response.status).toBe(400)
    expect(response.body.code).toBe('invalid_date_range')
    expect(response.body.error).toContain('7 days')
    expect(mockedFetchNeoRadarBrief).not.toHaveBeenCalled()
  })

  it('returns 502 when NASA NeoWs service fails', async () => {
    mockedFetchNeoRadarBrief.mockRejectedValue(new Error('NASA NeoWs API responded with 500'))

    const response = await request(createApp()).get(
      '/api/neows/radar-brief?start_date=2026-03-14&end_date=2026-03-14',
    )

    expect(response.status).toBe(502)
    expect(response.body.code).toBe('upstream_service_unavailable')
    expect(response.body.error).toContain('temporarily unavailable')
  })
})
