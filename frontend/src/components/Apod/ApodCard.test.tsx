import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ApodCard from './ApodCard'
import type { ApodItem } from '@/types/apod'

const baseItem: ApodItem = {
  date: '2026-03-11',
  title: 'Test Image',
  explanation: 'A cosmic test image.',
  url: 'https://example.com/image.jpg',
  media_type: 'image',
}

describe('ApodCard', () => {
  it('renders an image card with title', () => {
    render(<ApodCard item={baseItem} onClick={() => {}} />)

    const image = screen.getByAltText('Test Image')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', baseItem.url)
    expect(screen.getByText('Test Image')).toBeInTheDocument()
    expect(screen.getByText('image')).toBeInTheDocument()
  })

  it('calls onClick with the item when clicked', () => {
    const onClick = vi.fn()

    render(<ApodCard item={baseItem} onClick={onClick} />)

    fireEvent.click(screen.getByRole('button'))

    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onClick).toHaveBeenCalledWith(baseItem)
  })

  it('renders a formatted date', () => {
    render(<ApodCard item={baseItem} onClick={() => {}} />)

    expect(screen.getByText(/March/)).toBeInTheDocument()
    expect(screen.getByText(/2026/)).toBeInTheDocument()
  })

  it('renders the explanation teaser', () => {
    render(<ApodCard item={baseItem} onClick={() => {}} />)

    expect(screen.getByText('A cosmic test image.')).toBeInTheDocument()
  })

  it('renders the view details call to action', () => {
    render(<ApodCard item={baseItem} onClick={() => {}} />)

    expect(screen.getByText('View details')).toBeInTheDocument()
  })

  it('renders a video card with video element for .mp4', () => {
    const videoItem: ApodItem = {
      ...baseItem,
      media_type: 'video',
      url: 'https://apod.nasa.gov/apod/image/2603/Eclipse.mp4',
      thumbnail_url: '',
    }

    const { container } = render(<ApodCard item={videoItem} onClick={() => {}} />)

    const video = container.querySelector('video')
    expect(video).toBeInTheDocument()
    expect(video).toHaveAttribute('src', videoItem.url)
    expect(screen.getByText('video')).toBeInTheDocument()
  })

  it('renders a play icon fallback for embed videos without thumbnail', () => {
    const embedItem: ApodItem = {
      ...baseItem,
      media_type: 'video',
      url: 'https://www.youtube.com/embed/abc123',
      thumbnail_url: '',
    }

    render(<ApodCard item={embedItem} onClick={() => {}} />)

    expect(screen.getByText('Video')).toBeInTheDocument()
    expect(screen.getByText('video')).toBeInTheDocument()
    expect(screen.queryByAltText('Test Image')).not.toBeInTheDocument()
  })

  it('renders an image when video has a thumbnail_url', () => {
    const videoWithThumb: ApodItem = {
      ...baseItem,
      media_type: 'video',
      url: 'https://www.youtube.com/embed/abc123',
      thumbnail_url: 'https://img.youtube.com/vi/abc123/0.jpg',
    }

    render(<ApodCard item={videoWithThumb} onClick={() => {}} />)

    const image = screen.getByAltText('Test Image')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', videoWithThumb.thumbnail_url)
  })

  it('shows copyright when available', () => {
    const itemWithCopyright: ApodItem = {
      ...baseItem,
      copyright: 'Jason Perry',
    }

    render(<ApodCard item={itemWithCopyright} onClick={() => {}} />)

    expect(screen.getByText('Jason Perry')).toBeInTheDocument()
  })

  it('shows NASA APOD as default credit', () => {
    render(<ApodCard item={baseItem} onClick={() => {}} />)

    expect(screen.getByText('NASA APOD')).toBeInTheDocument()
  })
})
