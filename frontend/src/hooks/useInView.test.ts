import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { useInView } from './useInView'

type ObserverCallback = IntersectionObserverCallback

function createRef(el: Element | null = document.createElement('div')) {
  return { current: el }
}

function setupObserverMock() {
  let capturedCallback: ObserverCallback | null = null
  let capturedOptions: IntersectionObserverInit | undefined
  const observeMock = vi.fn()
  const disconnectMock = vi.fn()

  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: ObserverCallback, options?: IntersectionObserverInit) {
        capturedCallback = callback
        capturedOptions = options
      }
      observe = observeMock
      disconnect = disconnectMock
      unobserve = vi.fn()
      takeRecords = vi.fn(() => [])
      root = null
      rootMargin = ''
      thresholds = []
    },
  )

  function fireIntersection(isIntersecting: boolean) {
    capturedCallback!([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver)
  }

  return { observeMock, disconnectMock, fireIntersection, getOptions: () => capturedOptions }
}

describe('useInView', () => {
  it('returns false initially', () => {
    setupObserverMock()
    const ref = createRef()
    const { result } = renderHook(() => useInView(ref))

    expect(result.current).toBe(false)
  })

  it('returns true when IntersectionObserver fires with isIntersecting: true', () => {
    const { fireIntersection } = setupObserverMock()
    const ref = createRef()
    const { result } = renderHook(() => useInView(ref))

    act(() => {
      fireIntersection(true)
    })

    expect(result.current).toBe(true)
  })

  it('remains false when IntersectionObserver fires with isIntersecting: false', () => {
    const { fireIntersection } = setupObserverMock()
    const ref = createRef()
    const { result } = renderHook(() => useInView(ref))

    act(() => {
      fireIntersection(false)
    })

    expect(result.current).toBe(false)
  })

  it('disconnects the observer after intersection', () => {
    const { fireIntersection, disconnectMock } = setupObserverMock()
    const ref = createRef()
    renderHook(() => useInView(ref))

    act(() => {
      fireIntersection(true)
    })

    expect(disconnectMock).toHaveBeenCalled()
  })

  it('does not disconnect when entry is not intersecting', () => {
    const { fireIntersection, disconnectMock } = setupObserverMock()
    const ref = createRef()
    renderHook(() => useInView(ref))

    act(() => {
      fireIntersection(false)
    })

    expect(disconnectMock).not.toHaveBeenCalled()
  })

  it('passes default rootMargin of 50px to IntersectionObserver', () => {
    const { getOptions } = setupObserverMock()
    const ref = createRef()
    renderHook(() => useInView(ref))

    expect(getOptions()?.rootMargin).toBe('50px')
  })

  it('passes custom rootMargin to IntersectionObserver', () => {
    const { getOptions } = setupObserverMock()
    const ref = createRef()
    renderHook(() => useInView(ref, '100px'))

    expect(getOptions()?.rootMargin).toBe('100px')
  })

  it('does not observe when ref.current is null', () => {
    const { observeMock } = setupObserverMock()
    const ref = createRef(null)
    renderHook(() => useInView(ref))

    expect(observeMock).not.toHaveBeenCalled()
  })

  it('observes the referenced element', () => {
    const { observeMock } = setupObserverMock()
    const el = document.createElement('div')
    const ref = createRef(el)
    renderHook(() => useInView(ref))

    expect(observeMock).toHaveBeenCalledWith(el)
  })

  it('disconnects the observer on unmount', () => {
    const { disconnectMock } = setupObserverMock()
    const ref = createRef()
    const { unmount } = renderHook(() => useInView(ref))

    unmount()

    expect(disconnectMock).toHaveBeenCalled()
  })
})
