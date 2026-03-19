import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ApodPage from '@/pages/ApodPage'
import { useApod } from '@/hooks/useApod'
import { useGridSize } from '@/hooks/useGridSize'
import type { ApodItem } from '@/types/apod'

vi.mock('@/hooks/useApod', () => ({
  useApod: vi.fn(),
}))

vi.mock('@/hooks/useGridSize', () => ({
  useGridSize: vi.fn(),
}))

vi.mock('@/components/Apod/DateFilter', () => ({
  default: ({
    onSingleDate,
    onReset,
    isFiltered,
  }: {
    onSingleDate: (date: string) => void
    onReset: () => void
    isFiltered: boolean
  }) => (
    <div>
      <button type="button" onClick={() => onSingleDate('2026-03-10')}>
        Apply test date filter
      </button>
      {isFiltered && (
        <button type="button" onClick={onReset}>
          Reset test filter
        </button>
      )}
    </div>
  ),
}))

vi.mock('@/components/Apod/FeaturedApodHeroSkeleton', () => ({
  default: () => <div data-testid="featured-hero-skeleton" />,
}))

vi.mock('@/components/Apod/ApodCardSkeleton', () => ({
  default: () => <div data-testid="apod-card-skeleton" />,
}))

const mockedUseApod = vi.mocked(useApod)
const mockedUseGridSize = vi.mocked(useGridSize)

const items: ApodItem[] = [
  {
    date: '2026-03-11',
    title: 'CG 4: The Globule and the Galaxy',
    explanation: 'A cosmic cloud with a galaxy in the distance.',
    url: 'https://example.com/apod-1.jpg',
    hdurl: 'https://example.com/apod-1-hd.jpg',
    media_type: 'image',
    copyright: 'William Vrbasso',
  },
  {
    date: '2026-03-10',
    title: 'Sky Glows over Paranal Observatory',
    explanation: 'Paranal observatory under a dramatic sky.',
    url: 'https://example.com/apod-2.jpg',
    media_type: 'image',
    copyright: 'Julien Looten',
  },
]

describe('ApodPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedUseGridSize.mockReturnValue({ cols: 2, pageSize: 8 })
  })

  it('renders a featured item and archive cards from APOD data', () => {
    mockedUseApod.mockReturnValue({
      items,
      loading: false,
      error: null,
      loadMore: vi.fn(),
      hasMore: true,
    })

    render(<ApodPage />)

    expect(screen.getByRole('heading', { name: items[0]!.title })).toBeInTheDocument()
    expect(screen.getByText('Browse recent discoveries')).toBeInTheDocument()
    expect(screen.getByText(items[1]!.title)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Explore details' })).toBeInTheDocument()
  })

  it('sets the document title on mount', () => {
    mockedUseApod.mockReturnValue({
      items,
      loading: false,
      error: null,
      loadMore: vi.fn(),
      hasMore: true,
    })

    render(<ApodPage />)

    expect(document.title).toBe('APOD | Wonders of the Universe | Home & Beyond')
  })

  it('renders an empty state when no items are returned', () => {
    mockedUseApod.mockReturnValue({
      items: [],
      loading: false,
      error: null,
      loadMore: vi.fn(),
      hasMore: false,
    })

    render(<ApodPage />)

    expect(screen.getByText('No results found for the selected date.')).toBeInTheDocument()
  })

  it('renders an error message when the hook returns an error', () => {
    mockedUseApod.mockReturnValue({
      items: [],
      loading: false,
      error: 'NASA is temporarily unavailable.',
      loadMore: vi.fn(),
      hasMore: false,
    })

    render(<ApodPage />)

    expect(screen.getByText('NASA is temporarily unavailable.')).toBeInTheDocument()
  })

  it('renders loading skeletons during the initial load', () => {
    mockedUseApod.mockReturnValue({
      items: [],
      loading: true,
      error: null,
      loadMore: vi.fn(),
      hasMore: false,
    })

    render(<ApodPage />)

    expect(screen.getByTestId('featured-hero-skeleton')).toBeInTheDocument()
    expect(screen.getAllByTestId('apod-card-skeleton')).toHaveLength(20)
    expect(screen.queryByText('No results found for the selected date.')).not.toBeInTheDocument()
  })

  it('opens and closes the APOD modal from the featured section', async () => {
    mockedUseApod.mockReturnValue({
      items,
      loading: false,
      error: null,
      loadMore: vi.fn(),
      hasMore: true,
    })

    render(<ApodPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Explore details' }))

    expect(await screen.findByRole('button', { name: 'Close modal' })).toBeInTheDocument()
    expect(screen.getAllByText(items[0]!.title).length).toBeGreaterThan(1)
    expect(screen.queryByText('Published')).not.toBeInTheDocument()
    expect(screen.queryByText('Media')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Close modal' }))

    expect(screen.queryByRole('button', { name: 'Close modal' })).not.toBeInTheDocument()
  })

  it('calls loadMore when the archive button is clicked', () => {
    const loadMore = vi.fn()

    mockedUseApod.mockReturnValue({
      items,
      loading: false,
      error: null,
      loadMore,
      hasMore: true,
    })

    render(<ApodPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Load more' }))

    expect(loadMore).toHaveBeenCalledTimes(1)
  })

  it('does not render the load more button when there are no more items', () => {
    mockedUseApod.mockReturnValue({
      items,
      loading: false,
      error: null,
      loadMore: vi.fn(),
      hasMore: false,
    })

    render(<ApodPage />)

    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument()
  })

  it('renders filtered results without the featured hero and includes all items in the grid', () => {
    mockedUseApod.mockImplementation(({ date, startDate }) => ({
      items,
      loading: false,
      error: null,
      loadMore: vi.fn(),
      hasMore: !(date || startDate),
    }))

    render(<ApodPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Apply test date filter' }))

    expect(screen.queryByRole('button', { name: 'Explore details' })).not.toBeInTheDocument()
    expect(screen.getByText(items[0]!.title)).toBeInTheDocument()
    expect(screen.getByText(items[1]!.title)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reset test filter' })).toBeInTheDocument()
    expect(mockedUseApod).toHaveBeenLastCalledWith({
      date: '2026-03-10',
      pageSize: 8,
    })
  })

  it('resets the filter and restores the featured layout', () => {
    mockedUseApod.mockImplementation(({ date, startDate }) => ({
      items,
      loading: false,
      error: null,
      loadMore: vi.fn(),
      hasMore: !(date || startDate),
    }))

    render(<ApodPage />)

    fireEvent.click(screen.getByRole('button', { name: 'Apply test date filter' }))
    expect(screen.queryByRole('button', { name: 'Explore details' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Reset test filter' }))

    expect(screen.getByRole('button', { name: 'Explore details' })).toBeInTheDocument()
    expect(mockedUseApod).toHaveBeenLastCalledWith({ pageSize: 8 })
  })
})
