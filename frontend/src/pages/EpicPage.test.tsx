import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import EpicPage from '@/pages/EpicPage'
import { useEpic, useEpicDates } from '@/hooks/useEpic'
import type { EpicImage } from '@/types/epic'

vi.mock('@/hooks/useEpic', () => ({
  useEpic: vi.fn(),
  useEpicDates: vi.fn(),
}))

vi.mock('@/components/Epic/EpicCard', () => ({
  default: ({ item, onClick }: { item: EpicImage; onClick: (item: EpicImage) => void }) => (
    <button type="button" onClick={() => onClick(item)} data-testid="epic-card">
      {item.caption}
    </button>
  ),
}))

vi.mock('@/components/Epic/EpicCardSkeleton', () => ({
  default: () => <div data-testid="epic-card-skeleton" />,
}))

vi.mock('@/components/Epic/EpicModal', () => ({
  default: ({ item, onClose }: { item: EpicImage; onClose: () => void }) => (
    <div data-testid="epic-modal">
      <p>{item.caption}</p>
      <button type="button" onClick={onClose} aria-label="Close modal">
        Close
      </button>
    </div>
  ),
}))

const mockedUseEpic = vi.mocked(useEpic)
const mockedUseEpicDates = vi.mocked(useEpicDates)

const images: EpicImage[] = [
  {
    identifier: '20260312003633',
    caption: 'Earth from DSCOVR',
    image: 'https://epic.gsfc.nasa.gov/archive/natural/2026/03/12/jpg/epic_1b_20260312003633.jpg',
    date: '2026-03-12 00:36:33',
    centroid_coordinates: { lat: 12.5, lon: -45.2 },
  },
  {
    identifier: '20260312015422',
    caption: 'Pacific Ocean view',
    image: 'https://epic.gsfc.nasa.gov/archive/natural/2026/03/12/jpg/epic_1b_20260312015422.jpg',
    date: '2026-03-12 01:54:22',
    centroid_coordinates: { lat: -5.3, lon: 170.1 },
  },
]

const dates = ['2026-03-12', '2026-03-11', '2026-03-10', '2026-03-09']

describe('EpicPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-16T12:00:00Z'))
    mockedUseEpicDates.mockReturnValue({ dates, loading: false })
    mockedUseEpic.mockReturnValue({ images, loading: false, error: null })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders EPIC description and date label', () => {
    render(<EpicPage />)

    expect(screen.getByText(/EPIC offers full-disk Earth imagery/)).toBeInTheDocument()
    expect(screen.getByText(/2026/)).toBeInTheDocument()
  })

  it('sets the document title on mount', () => {
    render(<EpicPage />)

    expect(document.title).toBe('EPIC | Wonders of the Universe | Home & Beyond')
  })

  it('renders EPIC image cards', () => {
    render(<EpicPage />)

    expect(screen.getAllByTestId('epic-card')).toHaveLength(2)
    expect(screen.getByText('Earth from DSCOVR')).toBeInTheDocument()
    expect(screen.getByText('Pacific Ocean view')).toBeInTheDocument()
  })

  it('renders loading skeletons when loading', () => {
    mockedUseEpic.mockReturnValue({ images: [], loading: true, error: null })

    render(<EpicPage />)

    expect(screen.getAllByTestId('epic-card-skeleton')).toHaveLength(8)
  })

  it('renders loading skeletons when dates are loading', () => {
    mockedUseEpicDates.mockReturnValue({ dates: [], loading: true })
    mockedUseEpic.mockReturnValue({ images: [], loading: false, error: null })

    render(<EpicPage />)

    expect(screen.getAllByTestId('epic-card-skeleton')).toHaveLength(8)
  })

  it('renders an error message when the hook returns an error', () => {
    mockedUseEpic.mockReturnValue({
      images: [],
      loading: false,
      error: "NASA's EPIC API is temporarily unavailable.",
    })

    render(<EpicPage />)

    expect(screen.getByText("NASA's EPIC API is temporarily unavailable.")).toBeInTheDocument()
  })

  it('renders empty state when no images available', () => {
    mockedUseEpic.mockReturnValue({ images: [], loading: false, error: null })

    render(<EpicPage />)

    expect(screen.getByText(/No EPIC imagery is available/)).toBeInTheDocument()
  })

  it('switches to enhanced collection when clicking Enhanced pill', () => {
    render(<EpicPage />)

    fireEvent.click(screen.getByText('Enhanced'))

    expect(mockedUseEpic).toHaveBeenLastCalledWith('enhanced', expect.anything())
  })

  it('shows date preset pills', () => {
    render(<EpicPage />)

    expect(screen.getByText('Latest')).toBeInTheDocument()
    expect(screen.getByText('Previous')).toBeInTheDocument()
    expect(screen.getByText('Last 7 days')).toBeInTheDocument()
    expect(screen.getByText('Last 30 days')).toBeInTheDocument()
    expect(screen.getByText('Custom')).toBeInTheDocument()
  })

  it('selects the previous available date when Previous is clicked', () => {
    render(<EpicPage />)

    fireEvent.click(screen.getByText('Previous'))

    expect(mockedUseEpic).toHaveBeenLastCalledWith('natural', '2026-03-11')
  })

  it('selects the closest available date when Last 7 days is clicked', () => {
    render(<EpicPage />)

    fireEvent.click(screen.getByText('Last 7 days'))

    expect(mockedUseEpic).toHaveBeenLastCalledWith('natural', '2026-03-09')
  })

  it('shows the custom date picker when Custom is clicked', () => {
    render(<EpicPage />)

    fireEvent.click(screen.getByText('Custom'))

    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('updates the selected date when using the custom date picker', () => {
    render(<EpicPage />)

    fireEvent.click(screen.getByText('Custom'))
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: '2026-03-10' },
    })

    expect(mockedUseEpic).toHaveBeenLastCalledWith('natural', '2026-03-10')
  })

  it('resets the selected date to the latest available date when switching collection', () => {
    mockedUseEpic.mockImplementation(() => ({
      images,
      loading: false,
      error: null,
    }))
    mockedUseEpicDates.mockImplementation((collection) => ({
      dates: collection === 'enhanced' ? ['2026-03-08', '2026-03-07'] : dates,
      loading: false,
    }))

    render(<EpicPage />)

    fireEvent.click(screen.getByText('Previous'))
    expect(mockedUseEpic).toHaveBeenLastCalledWith('natural', '2026-03-11')

    fireEvent.click(screen.getByText('Enhanced'))

    expect(mockedUseEpic).toHaveBeenLastCalledWith('enhanced', '2026-03-08')
  })

  it('opens and closes the detail modal when a card is clicked', () => {
    render(<EpicPage />)

    fireEvent.click(screen.getAllByTestId('epic-card')[0]!)
    expect(screen.getByTestId('epic-modal')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Close modal' }))
    expect(screen.queryByTestId('epic-modal')).not.toBeInTheDocument()
  })

  it('calls useEpic with the first available date by default', () => {
    render(<EpicPage />)

    expect(mockedUseEpic).toHaveBeenCalledWith('natural', '2026-03-12')
  })
})
