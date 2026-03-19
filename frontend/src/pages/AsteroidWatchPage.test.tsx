import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import AsteroidWatchPage from '@/pages/AsteroidWatchPage'
import { useNeows } from '@/hooks/useNeows'
import type { NeoFeedResult } from '@/types/neows'

vi.mock('@/hooks/useNeows', () => ({
  useNeows: vi.fn(),
}))

vi.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'dark', toggleTheme: vi.fn() }),
}))

vi.mock('@/components/NeoWs/AsteroidWatchSkeleton', () => ({
  default: () => <div data-testid="asteroid-watch-skeleton" />,
  AsteroidWatchSkeletonContent: () => <div data-testid="asteroid-watch-skeleton" />,
  AsteroidWatchChartsSkeleton: () => <div data-testid="asteroid-watch-charts-skeleton" />,
  AsteroidWatchTableSkeleton: () => <div data-testid="asteroid-watch-table-skeleton" />,
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <AsteroidWatchPage />
    </MemoryRouter>,
  )
}

// Mock Recharts — rendering real SVG charts in jsdom is unreliable
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="responsive-container">{children}</div>
  ),
  BarChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="bar-chart">{children}</div>
  ),
  Bar: () => null,
  XAxis: () => null,
  YAxis: () => null,
  ZAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  ScatterChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="scatter-chart">{children}</div>
  ),
  Scatter: () => null,
  Cell: () => null,
  PieChart: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="pie-chart">{children}</div>
  ),
  Pie: () => null,
  Legend: () => null,
}))

const mockedUseNeows = vi.mocked(useNeows)

const sampleFeed: NeoFeedResult = {
  element_count: 2,
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
      {
        id: '2523759',
        name: '(2005 YQ96)',
        nasa_jpl_url: 'https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=2523759',
        absolute_magnitude_h: 21.4,
        estimated_diameter: {
          kilometers: { estimated_diameter_min: 0.13, estimated_diameter_max: 0.29 },
          meters: { estimated_diameter_min: 130, estimated_diameter_max: 290 },
        },
        is_potentially_hazardous_asteroid: true,
        close_approach_data: [
          {
            close_approach_date: '2026-03-14',
            close_approach_date_full: '2026-Mar-14 15:00',
            epoch_date_close_approach: 1773592400000,
            relative_velocity: {
              kilometers_per_second: '25.678',
              kilometers_per_hour: '92440.0',
              miles_per_hour: '57439.0',
            },
            miss_distance: {
              astronomical: '0.10',
              lunar: '38.90',
              kilometers: '14960000',
              miles: '9296000',
            },
            orbiting_body: 'Earth',
          },
        ],
        is_sentry_object: false,
      },
    ],
  },
}

const emptyFeed: NeoFeedResult = {
  element_count: 0,
  near_earth_objects: {},
}

describe('AsteroidWatchPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-03-14T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('sets document title on mount', () => {
    mockedUseNeows.mockReturnValue({ data: null, loading: false, error: null })
    renderPage()
    expect(document.title).toBe('Asteroid Watch | Home & Beyond')
  })

  it('renders page heading and description', () => {
    mockedUseNeows.mockReturnValue({ data: null, loading: false, error: null })
    renderPage()
    expect(screen.getByRole('heading', { name: 'Asteroid Watch', level: 1 })).toBeInTheDocument()
    expect(screen.getByText(/Track near-Earth objects/)).toBeInTheDocument()
  })

  it('renders loading skeleton while fetching', () => {
    mockedUseNeows.mockReturnValue({ data: null, loading: true, error: null })
    renderPage()
    expect(screen.getByTestId('asteroid-watch-skeleton')).toBeInTheDocument()
  })

  it('renders error message', () => {
    mockedUseNeows.mockReturnValue({
      data: null,
      loading: false,
      error: "NASA's NeoWs API is temporarily unavailable.",
    })
    renderPage()
    expect(screen.getByText(/temporarily unavailable/)).toBeInTheDocument()
  })

  it('renders an empty state for a valid empty feed', () => {
    mockedUseNeows.mockReturnValue({ data: emptyFeed, loading: false, error: null })
    renderPage()

    expect(screen.getByText('No near-Earth objects found for this range')).toBeInTheDocument()
    expect(screen.queryByText('Near-Earth Objects')).not.toBeInTheDocument()
    expect(screen.queryByText(/1–0 of 0/)).not.toBeInTheDocument()
  })

  it('renders summary stat cards with data', () => {
    mockedUseNeows.mockReturnValue({ data: sampleFeed, loading: false, error: null })
    renderPage()

    const totalCard = screen.getByText('Total asteroids').closest('div')!
    expect(within(totalCard).getByText('2')).toBeInTheDocument()
    expect(within(totalCard).getByText('1 potentially hazardous')).toBeInTheDocument()
    expect(screen.getByText('Closest approach')).toBeInTheDocument()
    expect(screen.getByText('Fastest')).toBeInTheDocument()
    expect(screen.getByText('Largest (est.)')).toBeInTheDocument()
  })

  it('renders all three chart containers', async () => {
    mockedUseNeows.mockReturnValue({ data: sampleFeed, loading: false, error: null })
    renderPage()

    expect(await screen.findByText('Daily Near-Earth Objects')).toBeInTheDocument()
    expect(screen.getByText('Hazardous Classification')).toBeInTheDocument()
    expect(screen.getByText('Velocity vs. Miss Distance')).toBeInTheDocument()
    expect(await screen.findByTestId('bar-chart')).toBeInTheDocument()
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument()
    expect(screen.getByTestId('scatter-chart')).toBeInTheDocument()
  })

  it('renders asteroid data table with rows sorted by distance', () => {
    mockedUseNeows.mockReturnValue({ data: sampleFeed, loading: false, error: null })
    renderPage()

    expect(screen.getByText('Near-Earth Objects')).toBeInTheDocument()

    // Names appear in both stat cards and table — use getAllByText
    expect(screen.getAllByText('2019 FO').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('2005 YQ96').length).toBeGreaterThanOrEqual(1)

    // First data row should be closest (2019 FO at 11.67 LD)
    const tbody = screen.getAllByRole('rowgroup')[1]!
    const rows = within(tbody).getAllByRole('row')
    expect(rows[0]).toHaveTextContent('2019 FO')
    expect(rows[1]).toHaveTextContent('2005 YQ96')
  })

  it('renders hazardous badge for potentially hazardous asteroids', () => {
    mockedUseNeows.mockReturnValue({ data: sampleFeed, loading: false, error: null })
    renderPage()

    const yesLabels = screen.getAllByText('Yes')
    expect(yesLabels).toHaveLength(1)
  })

  it('renders date filter presets', () => {
    mockedUseNeows.mockReturnValue({ data: null, loading: false, error: null })
    renderPage()

    expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Yesterday' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Last 3 days' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Last 7 days' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Custom' })).toBeInTheDocument()
  })

  it('applies the Yesterday preset', async () => {
    mockedUseNeows.mockReturnValue({ data: null, loading: false, error: null })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Yesterday' }))

    const [start, end] = mockedUseNeows.mock.lastCall!
    expect(start).toBe('2026-03-13')
    expect(end).toBe('2026-03-13')
  })

  it('supports a custom single-date selection', async () => {
    mockedUseNeows.mockReturnValue({ data: null, loading: false, error: null })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Custom' }))
    await user.click(screen.getByRole('button', { name: 'Single date' }))

    const dayButtons = screen.getAllByRole('button', { name: '12' })
    const calendarDay = dayButtons.find((btn) => !(btn as HTMLButtonElement).disabled)
    await user.click(calendarDay!)

    expect(mockedUseNeows).toHaveBeenLastCalledWith(expect.any(String), expect.any(String))
    const [start, end] = mockedUseNeows.mock.lastCall!
    expect(start).toBe(end)
  })

  it('resets back to the default range after clearing a custom filter', async () => {
    mockedUseNeows.mockReturnValue({ data: sampleFeed, loading: false, error: null })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderPage()

    const initialCall = mockedUseNeows.mock.calls.at(-1)
    await user.click(screen.getByRole('button', { name: 'Yesterday' }))
    await user.click(screen.getByRole('button', { name: 'Clear filter' }))

    expect(mockedUseNeows.mock.calls.at(-1)).toEqual(initialCall)
  })

  it('clamps custom date ranges to a maximum of 7 days in the UI', async () => {
    mockedUseNeows.mockReturnValue({ data: null, loading: false, error: null })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Custom' }))
    const day1 = screen
      .getAllByRole('button', { name: '1' })
      .find((btn) => !(btn as HTMLButtonElement).disabled)
    const day14 = screen
      .getAllByRole('button', { name: '14' })
      .find((btn) => !(btn as HTMLButtonElement).disabled)

    await user.click(day1!)
    await user.click(day14!)

    expect(mockedUseNeows).toHaveBeenLastCalledWith(expect.any(String), expect.any(String))
    const [start, end] = mockedUseNeows.mock.lastCall!
    expect(
      Math.round(
        (new Date(`${end}T00:00:00`).getTime() - new Date(`${start}T00:00:00`).getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    ).toBe(6)
  })

  it('does not render charts or table when data is null', () => {
    mockedUseNeows.mockReturnValue({ data: null, loading: false, error: null })
    renderPage()

    expect(screen.queryByText('Daily Near-Earth Objects')).not.toBeInTheDocument()
    expect(screen.queryByText('Near-Earth Objects')).not.toBeInTheDocument()
  })

  it('sorts table by name when clicking the Name header', async () => {
    mockedUseNeows.mockReturnValue({ data: sampleFeed, loading: false, error: null })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderPage()

    // Default sort is distance asc — 2019 FO first
    const tbody = screen.getAllByRole('rowgroup')[1]!
    let rows = within(tbody).getAllByRole('row')
    expect(rows[0]).toHaveTextContent('2019 FO')

    // Click Name header to sort alphabetically
    await user.click(screen.getByRole('button', { name: /Name/ }))

    rows = within(tbody).getAllByRole('row')
    // 2005 YQ96 comes before 2019 FO alphabetically
    expect(rows[0]).toHaveTextContent('2005 YQ96')
    expect(rows[1]).toHaveTextContent('2019 FO')
  })

  it('toggles the default distance sort to descending when clicking the active header', async () => {
    mockedUseNeows.mockReturnValue({ data: sampleFeed, loading: false, error: null })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderPage()

    // Default: distance asc — 2019 FO at 11.67 LD first
    const distBtn = screen.getByRole('button', { name: /Miss Distance/ })

    // Click to toggle to desc
    await user.click(distBtn)

    const tbody = screen.getAllByRole('rowgroup')[1]!
    const rows = within(tbody).getAllByRole('row')
    expect(rows[0]).toHaveTextContent('2005 YQ96')
    expect(rows[1]).toHaveTextContent('2019 FO')
  })

  it('renders sortable header chevrons', () => {
    mockedUseNeows.mockReturnValue({ data: sampleFeed, loading: false, error: null })
    renderPage()

    const headers = screen.getAllByRole('columnheader')
    // Each header should contain a button with sort chevrons
    for (const header of headers) {
      expect(within(header).getByRole('button')).toBeInTheDocument()
      expect(header).toHaveTextContent('▲')
      expect(header).toHaveTextContent('▼')
    }
  })

  it('renders pagination controls with rows-per-page dropdown', () => {
    mockedUseNeows.mockReturnValue({ data: sampleFeed, loading: false, error: null })
    renderPage()

    const dropdowns = screen.getAllByRole('button', { name: 'Rows per page' })
    expect(dropdowns).toHaveLength(1)
    expect(
      screen.getByText(
        /LD \(Lunar Distance\) = ~384,400 km, the average distance from Earth to the Moon\./,
      ),
    ).toBeInTheDocument()
    expect(screen.getByText(/1–2 of 2/)).toBeInTheDocument()
  })

  it('opens rows-per-page dropdown and shows options', async () => {
    mockedUseNeows.mockReturnValue({ data: sampleFeed, loading: false, error: null })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderPage()

    const dropdowns = screen.getAllByRole('button', { name: 'Rows per page' })
    await user.click(dropdowns[0]!)

    const menu = screen.getByRole('menu')
    expect(within(menu).getByRole('menuitem', { name: '25' })).toBeInTheDocument()
    expect(within(menu).getByRole('menuitem', { name: '50' })).toBeInTheDocument()
    expect(within(menu).getByRole('menuitem', { name: '100' })).toBeInTheDocument()
  })

  it('disables pagination buttons when all rows fit on one page', () => {
    mockedUseNeows.mockReturnValue({ data: sampleFeed, loading: false, error: null })
    renderPage()

    expect(screen.getByLabelText('Previous page')).toBeDisabled()
    expect(screen.getByLabelText('Next page')).toBeDisabled()
  })

  it('updates pagination when rows exceed one page', async () => {
    const largeFeed: NeoFeedResult = {
      element_count: 30,
      near_earth_objects: {
        '2026-03-14': Array.from({ length: 30 }, (_, index) => ({
          ...sampleFeed.near_earth_objects['2026-03-14']![0]!,
          id: `${index}`,
          name: `Asteroid ${index + 1}`,
        })),
      },
    }
    mockedUseNeows.mockReturnValue({ data: largeFeed, loading: false, error: null })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderPage()

    expect(screen.getByText(/1–25 of 30/)).toBeInTheDocument()
    expect(screen.getByLabelText('Next page')).toBeEnabled()

    await user.click(screen.getByLabelText('Next page'))

    expect(screen.getByText(/26–30 of 30/)).toBeInTheDocument()
    expect(screen.getByLabelText('Previous page')).toBeEnabled()
  })

  it('calls useNeows with the default last-7-days range on mount', () => {
    mockedUseNeows.mockReturnValue({ data: null, loading: false, error: null })
    renderPage()

    expect(mockedUseNeows).toHaveBeenCalledWith('2026-03-08', '2026-03-14')
  })

  it('applies the Today preset as a single-day range', async () => {
    mockedUseNeows.mockReturnValue({ data: null, loading: false, error: null })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Today' }))

    const [start, end] = mockedUseNeows.mock.lastCall!
    expect(start).toBe('2026-03-14')
    expect(end).toBe('2026-03-14')
  })

  it('applies the Last 3 days preset', async () => {
    mockedUseNeows.mockReturnValue({ data: null, loading: false, error: null })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Last 3 days' }))

    const [start, end] = mockedUseNeows.mock.lastCall!
    expect(start).toBe('2026-03-12')
    expect(end).toBe('2026-03-14')
  })

  it('closes the custom calendar when clicking outside', async () => {
    mockedUseNeows.mockReturnValue({ data: null, loading: false, error: null })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Custom' }))
    expect(screen.getByRole('button', { name: 'Single date' })).toBeInTheDocument()

    fireEvent.mouseDown(document.body)

    expect(screen.queryByRole('button', { name: 'Single date' })).not.toBeInTheDocument()
  })

  it('switches between Single date and Date range calendar modes', async () => {
    mockedUseNeows.mockReturnValue({ data: null, loading: false, error: null })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderPage()

    await user.click(screen.getByRole('button', { name: 'Custom' }))
    expect(screen.getByText('Pick a start date')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Single date' }))
    expect(screen.queryByText('Pick a start date')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Date range' }))
    expect(screen.getByText('Pick a start date')).toBeInTheDocument()
  })

  it('changes rows per page and resets to the first page', async () => {
    const largeFeed: NeoFeedResult = {
      element_count: 30,
      near_earth_objects: {
        '2026-03-14': Array.from({ length: 30 }, (_, index) => ({
          ...sampleFeed.near_earth_objects['2026-03-14']![0]!,
          id: `${index}`,
          name: `Asteroid ${index + 1}`,
        })),
      },
    }
    mockedUseNeows.mockReturnValue({ data: largeFeed, loading: false, error: null })
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    renderPage()

    // Navigate to page 2
    await user.click(screen.getByLabelText('Next page'))
    expect(screen.getByText(/26–30 of 30/)).toBeInTheDocument()

    // Change rows per page to 50
    const dropdowns = screen.getAllByRole('button', { name: 'Rows per page' })
    await user.click(dropdowns[0]!)
    await user.click(within(screen.getByRole('menu')).getByRole('menuitem', { name: '50' }))

    // Should reset to page 1 and show all 30 rows
    expect(screen.getByText(/1–30 of 30/)).toBeInTheDocument()
  })
})
