import '@testing-library/jest-dom'
import { vi } from 'vitest'

class IntersectionObserverMock implements IntersectionObserver {
  readonly root: Element | Document | null
  readonly rootMargin: string
  readonly thresholds: ReadonlyArray<number>
  readonly callback?: IntersectionObserverCallback

  constructor(callback?: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback
    this.root = options?.root ?? null
    this.rootMargin = options?.rootMargin ?? ''
    this.thresholds = Array.isArray(options?.threshold)
      ? options.threshold
      : options?.threshold !== undefined
        ? [options.threshold]
        : []
  }

  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return []
  }
}

Object.defineProperty(globalThis, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserverMock,
})

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

Object.defineProperty(window, 'scrollTo', {
  writable: true,
  configurable: true,
  value: vi.fn(),
})

const canvas2dContextMock = {
  setTransform: vi.fn(),
  clearRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  fillStyle: '',
}

Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
  writable: true,
  configurable: true,
  value: vi.fn((contextId: string) => {
    if (contextId === '2d') {
      return canvas2dContextMock
    }

    return null
  }),
})
