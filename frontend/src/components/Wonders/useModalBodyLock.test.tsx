import { render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useModalBodyLock } from './useModalBodyLock'

function ModalLockHarness({ active }: { active: boolean }) {
  useModalBodyLock(active)
  return null
}

describe('useModalBodyLock', () => {
  beforeEach(() => {
    document.body.style.cssText = ''
    document.documentElement.style.cssText = ''
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      writable: true,
      value: 1280,
    })
    Object.defineProperty(document.documentElement, 'clientWidth', {
      configurable: true,
      value: 1264,
    })
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      writable: true,
      value: 240,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
    document.body.style.cssText = ''
    document.documentElement.style.cssText = ''
  })

  it('locks body and html scrolling while active and restores scroll position on cleanup', () => {
    document.body.style.overflow = 'auto'
    document.documentElement.style.overflow = 'clip'

    const { unmount } = render(<ModalLockHarness active />)

    expect(document.body.style.overflow).toBe('hidden')
    expect(document.body.style.position).toBe('fixed')
    expect(document.body.style.top).toBe('-240px')
    expect(document.body.style.width).toBe('100%')
    expect(document.body.style.paddingRight).toBe('16px')
    expect(document.documentElement.style.overflow).toBe('hidden')
    expect(document.documentElement.style.overscrollBehavior).toBe('none')

    unmount()

    expect(document.body.style.overflow).toBe('auto')
    expect(document.body.style.position).toBe('')
    expect(document.body.style.top).toBe('')
    expect(document.body.style.width).toBe('')
    expect(document.body.style.paddingRight).toBe('')
    expect(document.documentElement.style.overflow).toBe('clip')
    expect(document.documentElement.style.overscrollBehavior).toBe('')
    expect(window.scrollTo).toHaveBeenCalledWith(0, 240)
  })

  it('keeps the lock until the final modal unmounts', () => {
    const first = render(<ModalLockHarness active />)
    const second = render(<ModalLockHarness active />)

    expect(document.body.style.position).toBe('fixed')

    first.unmount()
    expect(document.body.style.position).toBe('fixed')

    second.unmount()
    expect(document.body.style.position).toBe('')
  })
})
