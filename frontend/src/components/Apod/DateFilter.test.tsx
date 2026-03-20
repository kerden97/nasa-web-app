import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import DateFilter from '@/components/Apod/DateFilter'

function mockMobileMatchMedia(isMobile: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === '(max-width: 767px)' ? isMobile : false,
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

describe('DateFilter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-17T12:00:00Z'))
    mockMobileMatchMedia(true)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('collapses presets into a mobile overflow menu and keeps custom separate', () => {
    const onSingleDate = vi.fn()

    render(
      <DateFilter
        onSingleDate={onSingleDate}
        onDateRange={vi.fn()}
        onReset={vi.fn()}
        isFiltered={false}
      />,
    )

    expect(screen.getByRole('button', { name: 'Today' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'More presets' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Custom' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Yesterday' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'More presets' }))
    fireEvent.click(screen.getByRole('menuitem', { name: 'Yesterday' }))

    expect(onSingleDate).toHaveBeenCalledWith('2026-03-16')
  })
})
