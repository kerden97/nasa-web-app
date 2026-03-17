import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AsteroidWatchSkeletonContent } from '@/components/NeoWs/AsteroidWatchSkeleton'

function mockMobileMatchMedia(isMobile: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === '(max-width: 639px)' ? isMobile : false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })),
  })
}

describe('AsteroidWatchSkeletonContent', () => {
  it('uses the compact mobile preset layout in the header filter row', () => {
    mockMobileMatchMedia(true)

    render(<AsteroidWatchSkeletonContent withHeader />)

    expect(screen.getByRole('button', { name: 'Last 7 days' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'More' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Custom' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Yesterday' })).not.toBeInTheDocument()
  })
})
