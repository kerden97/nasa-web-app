import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import NeoDateFilter from '@/components/NeoWs/NeoDateFilter'

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

describe('NeoDateFilter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-17T12:00:00Z'))
    mockMobileMatchMedia(true)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('collapses presets into a mobile overflow menu and keeps custom separate', () => {
    const onChange = vi.fn()

    render(
      <NeoDateFilter
        defaultRange={{ start: '2026-03-11', end: '2026-03-17' }}
        onChange={onChange}
      />,
    )

    expect(screen.getByRole('button', { name: 'Last 7 days' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'More presets' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Custom' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Yesterday' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'More presets' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Yesterday' }))

    expect(onChange).toHaveBeenCalledWith('2026-03-16', '2026-03-16')
  })
})
