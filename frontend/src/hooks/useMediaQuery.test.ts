import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useMediaQuery } from './useMediaQuery'

type ChangeListener = () => void

function mockMatchMedia(initialMatches: boolean) {
  let changeListener: ChangeListener | null = null

  const mediaQueryList = {
    matches: initialMatches,
    media: '',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn((event: string, listener: ChangeListener) => {
      if (event === 'change') changeListener = listener
    }),
    removeEventListener: vi.fn((event: string, listener: ChangeListener) => {
      if (event === 'change' && changeListener === listener) changeListener = null
    }),
    dispatchEvent: () => false,
  }

  vi.stubGlobal(
    'matchMedia',
    vi.fn(() => mediaQueryList),
  )

  function fireChange(newMatches: boolean) {
    mediaQueryList.matches = newMatches
    changeListener?.()
  }

  return { mediaQueryList, fireChange }
}

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('useMediaQuery', () => {
  it('returns true when the media query matches initially', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))

    expect(result.current).toBe(true)
  })

  it('returns false when the media query does not match initially', () => {
    mockMatchMedia(false)
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))

    expect(result.current).toBe(false)
  })

  it('updates when the media query match changes', () => {
    const { fireChange } = mockMatchMedia(false)
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'))

    expect(result.current).toBe(false)

    act(() => {
      fireChange(true)
    })

    expect(result.current).toBe(true)
  })

  it('subscribes using addEventListener', () => {
    const { mediaQueryList } = mockMatchMedia(false)
    renderHook(() => useMediaQuery('(min-width: 768px)'))

    expect(mediaQueryList.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('cleans up event listener on unmount', () => {
    const { mediaQueryList } = mockMatchMedia(false)
    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'))

    unmount()

    expect(mediaQueryList.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('passes the query string to matchMedia', () => {
    mockMatchMedia(false)
    renderHook(() => useMediaQuery('(prefers-color-scheme: dark)'))

    expect(window.matchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)')
  })
})
