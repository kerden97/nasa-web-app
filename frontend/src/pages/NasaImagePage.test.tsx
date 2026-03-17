import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import NasaImagePage from '@/pages/NasaImagePage'
import { useNasaImage } from '@/hooks/useNasaImage'
import type { NasaImageItem } from '@/types/nasaImage'

vi.mock('@/hooks/useNasaImage', () => ({
  useNasaImage: vi.fn(),
}))

vi.mock('@/components/NasaImage/ImageCard', () => ({
  default: ({ item, onClick }: { item: NasaImageItem; onClick: (item: NasaImageItem) => void }) => (
    <button type="button" onClick={() => onClick(item)} data-testid="image-card">
      {item.title}
    </button>
  ),
}))

vi.mock('@/components/NasaImage/ImageCardSkeleton', () => ({
  default: () => <div data-testid="image-card-skeleton" />,
}))

vi.mock('@/components/NasaImage/ImageModal', () => ({
  default: ({ item, onClose }: { item: NasaImageItem; onClose: () => void }) => (
    <div data-testid="image-modal">
      <p>{item.title}</p>
      <button type="button" onClick={onClose} aria-label="Close modal">
        Close
      </button>
    </div>
  ),
}))

const mockedUseNasaImage = vi.mocked(useNasaImage)

const items: NasaImageItem[] = [
  {
    nasa_id: 'PIA00001',
    title: 'Mars Surface',
    description: 'A view of the Mars surface.',
    date_created: '2020-07-30T00:00:00Z',
    media_type: 'image',
    href: 'https://example.com/thumb1.jpg',
  },
  {
    nasa_id: 'PIA00002',
    title: 'Nebula NGC 1234',
    description: 'A beautiful nebula.',
    date_created: '2019-05-15T00:00:00Z',
    media_type: 'image',
    href: 'https://example.com/thumb2.jpg',
  },
]

function getInput() {
  return screen.getByPlaceholderText(/nebula, apollo 11/i)
}

function submitSearch(query: string) {
  const input = getInput()
  fireEvent.change(input, { target: { value: query } })
  fireEvent.submit(input.closest('form')!)
}

describe('NasaImagePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the initial empty state with popular searches', () => {
    mockedUseNasaImage.mockReturnValue({
      items: [],
      totalHits: 0,
      loading: false,
      error: null,
      hasMore: false,
      loadMore: vi.fn(),
    })

    render(<NasaImagePage />)

    expect(screen.getByText('Popular searches')).toBeInTheDocument()
    expect(screen.getByText('Nebula')).toBeInTheDocument()
    expect(screen.getByText('Apollo 11')).toBeInTheDocument()
    expect(screen.getByText('Saturn')).toBeInTheDocument()
  })

  it('submits a search and displays results', () => {
    mockedUseNasaImage.mockReturnValue({
      items,
      totalHits: 2,
      loading: false,
      error: null,
      hasMore: false,
      loadMore: vi.fn(),
    })

    render(<NasaImagePage />)
    submitSearch('mars')

    expect(screen.getByText('Mars Surface')).toBeInTheDocument()
    expect(screen.getByText('Nebula NGC 1234')).toBeInTheDocument()
  })

  it('displays result count when results are found', () => {
    mockedUseNasaImage.mockReturnValue({
      items,
      totalHits: 245,
      loading: false,
      error: null,
      hasMore: true,
      loadMore: vi.fn(),
    })

    render(<NasaImagePage />)
    submitSearch('mars')

    expect(screen.getByText(/245 results for/i)).toBeInTheDocument()
  })

  it('renders loading skeletons during search', () => {
    mockedUseNasaImage.mockReturnValue({
      items: [],
      totalHits: 0,
      loading: true,
      error: null,
      hasMore: false,
      loadMore: vi.fn(),
    })

    render(<NasaImagePage />)
    submitSearch('mars')

    expect(screen.getByText('Search results')).toBeInTheDocument()
    expect(screen.getByText(/Searching for “mars”\.\.\./i)).toBeInTheDocument()
    expect(screen.getAllByTestId('image-card-skeleton')).toHaveLength(100)
  })

  it('renders an error message when the hook returns an error', () => {
    mockedUseNasaImage.mockReturnValue({
      items: [],
      totalHits: 0,
      loading: false,
      error: 'NASA Image Library is temporarily unavailable.',
      hasMore: false,
      loadMore: vi.fn(),
    })

    render(<NasaImagePage />)
    submitSearch('test')

    expect(screen.getByText('NASA Image Library is temporarily unavailable.')).toBeInTheDocument()
  })

  it('renders the no-results message for empty search', () => {
    mockedUseNasaImage.mockReturnValue({
      items: [],
      totalHits: 0,
      loading: false,
      error: null,
      hasMore: false,
      loadMore: vi.fn(),
    })

    render(<NasaImagePage />)
    submitSearch('xyznonexistent')

    expect(screen.getByText(/No results found/)).toBeInTheDocument()
  })

  it('renders and calls loadMore when the button is clicked', () => {
    const loadMore = vi.fn()

    mockedUseNasaImage.mockReturnValue({
      items,
      totalHits: 200,
      loading: false,
      error: null,
      hasMore: true,
      loadMore,
    })

    render(<NasaImagePage />)
    submitSearch('mars')

    fireEvent.click(screen.getByRole('button', { name: 'Load more' }))
    expect(loadMore).toHaveBeenCalledTimes(1)
  })

  it('does not render load more when hasMore is false', () => {
    mockedUseNasaImage.mockReturnValue({
      items,
      totalHits: 2,
      loading: false,
      error: null,
      hasMore: false,
      loadMore: vi.fn(),
    })

    render(<NasaImagePage />)
    submitSearch('mars')

    expect(screen.queryByRole('button', { name: 'Load more' })).not.toBeInTheDocument()
  })

  it('opens and closes the detail modal when a card is clicked', () => {
    mockedUseNasaImage.mockReturnValue({
      items,
      totalHits: 2,
      loading: false,
      error: null,
      hasMore: false,
      loadMore: vi.fn(),
    })

    render(<NasaImagePage />)
    submitSearch('mars')

    fireEvent.click(screen.getAllByTestId('image-card')[0]!)
    expect(screen.getByTestId('image-modal')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Close modal' }))
    expect(screen.queryByTestId('image-modal')).not.toBeInTheDocument()
  })

  it('triggers a search when a suggestion pill is clicked', () => {
    mockedUseNasaImage.mockReturnValue({
      items: [],
      totalHits: 0,
      loading: false,
      error: null,
      hasMore: false,
      loadMore: vi.fn(),
    })

    render(<NasaImagePage />)

    fireEvent.click(screen.getByText('Nebula'))

    expect(getInput()).toHaveValue('nebula')
    expect(mockedUseNasaImage).toHaveBeenLastCalledWith(
      expect.objectContaining({ query: 'nebula' }),
    )
  })

  it('sets the document title on mount', () => {
    mockedUseNasaImage.mockReturnValue({
      items: [],
      totalHits: 0,
      loading: false,
      error: null,
      hasMore: false,
      loadMore: vi.fn(),
    })

    render(<NasaImagePage />)

    expect(document.title).toBe('NASA Image Library | Wonders of the Universe | Home & Beyond')
  })

  it('passes the selected media type to the hook', () => {
    mockedUseNasaImage.mockReturnValue({
      items: [],
      totalHits: 0,
      loading: false,
      error: null,
      hasMore: false,
      loadMore: vi.fn(),
    })

    render(<NasaImagePage />)

    fireEvent.click(screen.getByRole('button', { name: 'Video' }))

    expect(mockedUseNasaImage).toHaveBeenLastCalledWith({
      query: '',
      mediaType: 'video',
    })
  })

  it('clears the search input and active query when the clear button is clicked', () => {
    mockedUseNasaImage.mockReturnValue({
      items,
      totalHits: 2,
      loading: false,
      error: null,
      hasMore: false,
      loadMore: vi.fn(),
    })

    render(<NasaImagePage />)
    submitSearch('mars')

    expect(getInput()).toHaveValue('mars')

    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }))

    expect(getInput()).toHaveValue('')
    expect(mockedUseNasaImage).toHaveBeenLastCalledWith({
      query: '',
      mediaType: undefined,
    })
  })

  it('trims the query before passing it into the hook state', () => {
    mockedUseNasaImage.mockReturnValue({
      items,
      totalHits: 2,
      loading: false,
      error: null,
      hasMore: false,
      loadMore: vi.fn(),
    })

    render(<NasaImagePage />)
    submitSearch(' mars ')

    expect(mockedUseNasaImage).toHaveBeenLastCalledWith({
      query: 'mars',
      mediaType: undefined,
    })
  })
})
