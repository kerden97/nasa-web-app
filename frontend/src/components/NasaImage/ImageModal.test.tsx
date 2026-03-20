import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import ImageModal from '@/components/NasaImage/ImageModal'
import type { NasaImageItem } from '@/types/nasaImage'

vi.mock('@/components/Wonders/ModalFrame', () => ({
  default: ({
    children,
  }: {
    children: ReactNode
    onClose: () => void
    maxWidthClass?: string
    titleId: string
  }) => <div>{children}</div>,
}))

vi.mock('@/hooks/useExternalLink', () => ({
  default: () => ({
    pendingExternalLink: null,
    queueExternalLink: vi.fn(),
    confirmExternalLink: vi.fn(),
    cancelExternalLink: vi.fn(),
  }),
}))

describe('ImageModal', () => {
  const mockedFetch = vi.fn()

  const videoItem: NasaImageItem = {
    nasa_id: 'GS-2026',
    title: 'Gamma Burst Transmission',
    description: 'A NASA library video item.',
    date_created: '2026-03-14T00:00:00Z',
    media_type: 'video',
    href: '',
    asset_manifest_url: 'https://images-assets.nasa.gov/video/GS-2026/collection.json',
  }

  beforeEach(() => {
    vi.stubGlobal('fetch', mockedFetch)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('requests playable assets through the backend endpoint', async () => {
    mockedFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          assets: ['https://images-assets.nasa.gov/video/GS-2026/GS-2026~orig.mp4'],
          preferredAsset: 'https://images-assets.nasa.gov/video/GS-2026/GS-2026~orig.mp4',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    render(<ImageModal item={videoItem} onClose={vi.fn()} />)

    expect(screen.getByText('Loading media...')).toBeInTheDocument()

    await waitFor(() => expect(mockedFetch).toHaveBeenCalledTimes(1))

    const requestedUrl = String(mockedFetch.mock.calls[0]![0])
    expect(requestedUrl).toContain('/api/nasa-image/assets?')
    expect(requestedUrl).toContain('media_type=video')
    expect(decodeURIComponent(requestedUrl)).toContain(
      'src=https://images-assets.nasa.gov/video/GS-2026/collection.json',
    )

    await waitFor(() =>
      expect(document.querySelector('video')).toHaveAttribute(
        'src',
        'https://images-assets.nasa.gov/video/GS-2026/GS-2026~orig.mp4',
      ),
    )
  })
})
