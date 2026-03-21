import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import RadarBriefModal from '@/components/NeoWs/RadarBriefModal'
import { fetchApi } from '@/lib/api'
import type { NeoRadarBriefResponse } from '@/types/neowsRadarBrief'

vi.mock('@/lib/api', () => ({
  fetchApi: vi.fn(),
}))

const mockedFetchApi = vi.mocked(fetchApi)

function createBrief(startDate: string, endDate: string): NeoRadarBriefResponse {
  return {
    source: 'ai',
    model: 'gpt-4o-mini',
    generatedAt: '2026-03-21T10:30:00.000Z',
    startDate,
    endDate,
    headline: `AI radar headline for ${startDate}`,
    overview: 'A concise AI-generated overview of the selected asteroid range.',
    impactScenario: 'An illustrative scenario used for storytelling only.',
    watchNotes: ['Watch note 1', 'Watch note 2', 'Watch note 3'],
    disclaimer: 'Illustrative scenario only. This is not a real impact forecast.',
    factsUsed: {
      totalObjects: 2,
      hazardousCount: 1,
      observationDays: 1,
      busiestDay: {
        date: startDate,
        count: 2,
        hazardousCount: 1,
      },
      closestApproach: {
        id: '1',
        name: 'Mock Alpha',
        date: startDate,
        hazardous: true,
        diameterMeters: 100,
        velocityKmS: 18.4,
        missDistanceLd: 4.67,
        nasaJplUrl: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=1',
      },
      fastestObject: {
        id: '1',
        name: 'Mock Alpha',
        date: startDate,
        hazardous: true,
        diameterMeters: 100,
        velocityKmS: 18.4,
        missDistanceLd: 4.67,
        nasaJplUrl: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=1',
      },
      largestObject: {
        id: '1',
        name: 'Mock Alpha',
        date: startDate,
        hazardous: true,
        diameterMeters: 100,
        velocityKmS: 18.4,
        missDistanceLd: 4.67,
        nasaJplUrl: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=1',
      },
      largestHazardousObject: {
        id: '1',
        name: 'Mock Alpha',
        date: startDate,
        hazardous: true,
        diameterMeters: 100,
        velocityKmS: 18.4,
        missDistanceLd: 4.67,
        nasaJplUrl: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=1',
      },
      impactSubject: {
        id: '1',
        name: 'Mock Alpha',
        date: startDate,
        hazardous: true,
        diameterMeters: 100,
        velocityKmS: 18.4,
        missDistanceLd: 4.67,
        nasaJplUrl: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=1',
      },
      impactComparison: 'roughly football-field scale',
      impactBand: 'a regional catastrophe',
      illustrativeEnergyMegatons: 120,
    },
  }
}

function renderModal(startDate: string, endDate: string, onClose = vi.fn()) {
  return render(<RadarBriefModal startDate={startDate} endDate={endDate} onClose={onClose} />)
}

describe('RadarBriefModal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    document.body.style.cssText = ''
    document.documentElement.style.cssText = ''
  })

  it('shows a loading state and then renders the fetched radar brief', async () => {
    const brief = createBrief('2026-03-14', '2026-03-14')
    mockedFetchApi.mockResolvedValue(brief)

    renderModal('2026-03-14', '2026-03-14')

    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(mockedFetchApi).toHaveBeenCalledWith(
      '/api/neows/radar-brief',
      { start_date: '2026-03-14', end_date: '2026-03-14' },
      expect.any(AbortSignal),
      expect.anything(),
    )

    expect(
      await screen.findByRole('heading', { name: brief.headline, level: 3 }),
    ).toBeInTheDocument()
    expect(screen.getByText('AI')).toBeInTheDocument()
    expect(screen.getAllByText('Mock Alpha')).toHaveLength(3)
    expect(screen.getByText('4.67 LD on 2026-03-14')).toBeInTheDocument()
    expect(screen.getByText(brief.disclaimer)).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('renders the error state when the radar brief request fails', async () => {
    mockedFetchApi.mockRejectedValue(new Error('Backend unavailable'))

    renderModal('2026-03-15', '2026-03-15')

    expect(await screen.findByText('Unable to generate the radar brief')).toBeInTheDocument()
    expect(screen.getByText('Backend unavailable')).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('reuses the session cache when the same date range is reopened', async () => {
    const brief = createBrief('2026-03-16', '2026-03-16')
    mockedFetchApi.mockResolvedValue(brief)

    const firstRender = renderModal('2026-03-16', '2026-03-16')
    expect(
      await screen.findByRole('heading', { name: brief.headline, level: 3 }),
    ).toBeInTheDocument()
    firstRender.unmount()

    renderModal('2026-03-16', '2026-03-16')

    expect(screen.getByRole('heading', { name: brief.headline, level: 3 })).toBeInTheDocument()
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(mockedFetchApi).toHaveBeenCalledTimes(1)
  })

  it('aborts the in-flight request when the modal unmounts', async () => {
    let capturedSignal: AbortSignal | undefined

    mockedFetchApi.mockImplementation((_path, _params, signal) => {
      capturedSignal = signal
      return new Promise<NeoRadarBriefResponse>(() => {})
    })

    const view = renderModal('2026-03-17', '2026-03-18')

    await waitFor(() => expect(capturedSignal).toBeDefined())
    expect(capturedSignal?.aborted).toBe(false)

    view.unmount()

    expect(capturedSignal?.aborted).toBe(true)
  })
})
