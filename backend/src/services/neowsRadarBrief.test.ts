const mockFetchNeoFeed = jest.fn()
const mockDurableGet = jest.fn()
const mockDurableSet = jest.fn()
const mockOpenAiParse = jest.fn()

jest.mock('./neows', () => ({
  fetchNeoFeed: mockFetchNeoFeed,
}))

jest.mock('../lib/durableCache', () => ({
  buildDurableCacheKey: (...parts: string[]) => parts.join('::'),
  durableCache: {
    get: mockDurableGet,
    set: mockDurableSet,
  },
}))

jest.mock('../lib/openai', () => ({
  openai: {
    responses: {
      parse: mockOpenAiParse,
    },
  },
  openAiEnabled: true,
  radarBriefModel: 'gpt-4o-mini',
}))

jest.mock('../lib/logger', () => ({
  __esModule: true,
  default: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}))

import type { CachedNeoRadarBrief, NeoRadarBriefFacts } from '../types/neowsRadarBrief'

describe('NeoWs radar brief service', () => {
  const sampleFeed = {
    element_count: 2,
    near_earth_objects: {
      '2026-03-14': [
        {
          id: '1',
          name: '(2026 AB)',
          nasa_jpl_url: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=1',
          absolute_magnitude_h: 22.4,
          estimated_diameter: {
            kilometers: { estimated_diameter_min: 0.08, estimated_diameter_max: 0.12 },
            meters: { estimated_diameter_min: 80, estimated_diameter_max: 120 },
          },
          is_potentially_hazardous_asteroid: true,
          close_approach_data: [
            {
              close_approach_date: '2026-03-14',
              close_approach_date_full: '2026-Mar-14 10:30',
              epoch_date_close_approach: 1773484200000,
              relative_velocity: {
                kilometers_per_second: '18.4',
                kilometers_per_hour: '66240',
                miles_per_hour: '41164',
              },
              miss_distance: {
                astronomical: '0.012',
                lunar: '4.67',
                kilometers: '1790000',
                miles: '1112260',
              },
              orbiting_body: 'Earth',
            },
          ],
          is_sentry_object: false,
        },
        {
          id: '2',
          name: '(2026 CD)',
          nasa_jpl_url: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=2',
          absolute_magnitude_h: 24.3,
          estimated_diameter: {
            kilometers: { estimated_diameter_min: 0.03, estimated_diameter_max: 0.05 },
            meters: { estimated_diameter_min: 30, estimated_diameter_max: 50 },
          },
          is_potentially_hazardous_asteroid: false,
          close_approach_data: [
            {
              close_approach_date: '2026-03-14',
              close_approach_date_full: '2026-Mar-14 13:05',
              epoch_date_close_approach: 1773493500000,
              relative_velocity: {
                kilometers_per_second: '9.7',
                kilometers_per_hour: '34920',
                miles_per_hour: '21698',
              },
              miss_distance: {
                astronomical: '0.023',
                lunar: '8.95',
                kilometers: '3440000',
                miles: '2137522',
              },
              orbiting_body: 'Earth',
            },
          ],
          is_sentry_object: false,
        },
      ],
    },
  }

  const sampleFacts: NeoRadarBriefFacts = {
    totalObjects: 2,
    hazardousCount: 1,
    observationDays: 1,
    busiestDay: {
      date: '2026-03-14',
      count: 2,
      hazardousCount: 1,
    },
    closestApproach: {
      id: '1',
      name: '2026 AB',
      date: '2026-03-14',
      hazardous: true,
      diameterMeters: 100,
      velocityKmS: 18.4,
      missDistanceLd: 4.67,
      nasaJplUrl: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=1',
    },
    fastestObject: {
      id: '1',
      name: '2026 AB',
      date: '2026-03-14',
      hazardous: true,
      diameterMeters: 100,
      velocityKmS: 18.4,
      missDistanceLd: 4.67,
      nasaJplUrl: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=1',
    },
    largestObject: {
      id: '1',
      name: '2026 AB',
      date: '2026-03-14',
      hazardous: true,
      diameterMeters: 100,
      velocityKmS: 18.4,
      missDistanceLd: 4.67,
      nasaJplUrl: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=1',
    },
    largestHazardousObject: {
      id: '1',
      name: '2026 AB',
      date: '2026-03-14',
      hazardous: true,
      diameterMeters: 100,
      velocityKmS: 18.4,
      missDistanceLd: 4.67,
      nasaJplUrl: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=1',
    },
    impactSubject: {
      id: '1',
      name: '2026 AB',
      date: '2026-03-14',
      hazardous: true,
      diameterMeters: 100,
      velocityKmS: 18.4,
      missDistanceLd: 4.67,
      nasaJplUrl: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=1',
    },
    impactComparison: 'roughly football-field scale',
    impactBand: 'a regional catastrophe',
    illustrativeEnergyMegatons: 120,
  }

  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-03-15T12:00:00Z'))
    jest.clearAllMocks()
    mockFetchNeoFeed.mockResolvedValue(sampleFeed)
    mockDurableGet.mockResolvedValue(null)
    mockDurableSet.mockResolvedValue(undefined)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('returns and caches an AI-generated radar brief', async () => {
    mockOpenAiParse.mockResolvedValue({
      output_parsed: {
        headline: 'AI radar headline',
        overview: 'A concise AI-generated overview of the selected asteroid range.',
        impactScenario: 'An illustrative scenario used for storytelling only.',
        watchNotes: ['Watch note 1', 'Watch note 2', 'Watch note 3'],
        disclaimer: 'This is not a real impact forecast.',
      },
    })

    const { fetchNeoRadarBrief } = await import('./neowsRadarBrief')
    const result = await fetchNeoRadarBrief('2026-03-14', '2026-03-14')

    expect(result.source).toBe('ai')
    expect(result.model).toBe('gpt-4o-mini')
    expect(result.headline).toBe('AI radar headline')
    expect(result.factsUsed.totalObjects).toBe(2)
    expect(mockFetchNeoFeed).toHaveBeenCalledWith('2026-03-14', '2026-03-14')
    expect(mockOpenAiParse).toHaveBeenCalledTimes(1)
    expect(mockDurableSet).toHaveBeenCalledWith(
      expect.stringContaining('neows::radar-brief'),
      expect.objectContaining({
        source: 'ai',
        promptVersion: 1,
        fingerprint: expect.any(String),
        headline: 'AI radar headline',
      }),
    )
  })

  it('falls back to a deterministic brief when AI generation fails', async () => {
    mockOpenAiParse.mockRejectedValue(new Error('OpenAI unavailable'))

    const { fetchNeoRadarBrief } = await import('./neowsRadarBrief')
    const result = await fetchNeoRadarBrief('2026-03-14', '2026-03-14')

    expect(result.source).toBe('fallback')
    expect(result.model).toBeNull()
    expect(result.headline).toContain('Radar brief for 2026-03-14')
    expect(result.watchNotes).toHaveLength(3)
    expect(result.disclaimer).toContain('Illustrative scenario only')
    expect(mockDurableSet).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        source: 'fallback',
        model: null,
        promptVersion: 1,
      }),
    )
  })

  it('reuses a cached historical brief without calling OpenAI again', async () => {
    const cachedBrief: CachedNeoRadarBrief = {
      source: 'ai',
      model: 'gpt-4o-mini',
      generatedAt: '2026-03-14T12:00:00.000Z',
      startDate: '2026-03-14',
      endDate: '2026-03-14',
      headline: 'Cached radar headline',
      overview: 'Cached overview',
      impactScenario: 'Cached impact scenario',
      watchNotes: ['Cached note 1', 'Cached note 2', 'Cached note 3'],
      disclaimer: 'Cached disclaimer',
      promptVersion: 1,
      fingerprint: 'cached-fingerprint',
      factsUsed: sampleFacts,
    }
    mockDurableGet.mockResolvedValue(cachedBrief)

    const { fetchNeoRadarBrief } = await import('./neowsRadarBrief')
    const result = await fetchNeoRadarBrief('2026-03-14', '2026-03-14')

    expect(result.source).toBe('ai')
    expect(result.headline).toBe('Cached radar headline')
    expect(result.factsUsed.totalObjects).toBe(2)
    expect(mockOpenAiParse).not.toHaveBeenCalled()
    expect(mockDurableSet).not.toHaveBeenCalled()
  })
})
