import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import ApodInitialLoadingState from '@/components/Apod/ApodInitialLoadingState'

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

describe('ApodInitialLoadingState', () => {
  it('uses the compact mobile preset layout', () => {
    mockMobileMatchMedia(true)

    render(<ApodInitialLoadingState />)

    expect(screen.getByText('20 items')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'More' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Custom' })).toBeInTheDocument()
    expect(screen.queryByText('Last 30 days')).not.toBeInTheDocument()
  })
})
