import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useGridSize } from './useGridSize'

function setWidth(width: number) {
  Object.defineProperty(window, 'innerWidth', { value: width, writable: true, configurable: true })
}

afterEach(() => {
  vi.restoreAllMocks()
  setWidth(1024)
})

describe('useGridSize', () => {
  it('returns desktop grid at 1024px and above', () => {
    setWidth(1200)
    const { result } = renderHook(() => useGridSize())
    expect(result.current).toEqual({ cols: 4, pageSize: 20 })
  })

  it('returns tablet grid between 768px and 1023px', () => {
    setWidth(800)
    const { result } = renderHook(() => useGridSize())
    expect(result.current).toEqual({ cols: 3, pageSize: 12 })
  })

  it('returns small grid between 640px and 767px', () => {
    setWidth(700)
    const { result } = renderHook(() => useGridSize())
    expect(result.current).toEqual({ cols: 2, pageSize: 8 })
  })

  it('returns single-column grid below 640px', () => {
    setWidth(400)
    const { result } = renderHook(() => useGridSize())
    expect(result.current).toEqual({ cols: 1, pageSize: 8 })
  })

  it('updates when a resize crosses a breakpoint boundary', () => {
    setWidth(1200)
    const { result } = renderHook(() => useGridSize())
    expect(result.current.cols).toBe(4)

    act(() => {
      setWidth(700)
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current).toEqual({ cols: 2, pageSize: 8 })
  })

  it('does not update when resize stays within the same breakpoint', () => {
    setWidth(1200)
    const { result } = renderHook(() => useGridSize())
    const initial = result.current

    act(() => {
      setWidth(1100)
      window.dispatchEvent(new Event('resize'))
    })

    expect(result.current).toBe(initial)
  })

  it('cleans up the resize listener on unmount', () => {
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = renderHook(() => useGridSize())

    unmount()

    expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function))
  })
})
