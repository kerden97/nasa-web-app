import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import useExternalLink from './useExternalLink'

describe('useExternalLink', () => {
  let openMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    openMock = vi.fn()
    vi.stubGlobal('open', openMock)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it('starts with no pending link', () => {
    const { result } = renderHook(() => useExternalLink('Visit'))

    expect(result.current.pendingExternalLink).toBeNull()
  })

  it('queueExternalLink sets pending state with parsed hostname', () => {
    const { result } = renderHook(() => useExternalLink('Visit'))

    act(() => {
      result.current.queueExternalLink('https://example.com/some-page')
    })

    expect(result.current.pendingExternalLink).toEqual({
      href: 'https://example.com/some-page',
      hostname: 'example.com',
      label: 'Visit',
    })
  })

  it('queueExternalLink strips www prefix from hostname', () => {
    const { result } = renderHook(() => useExternalLink('Visit'))

    act(() => {
      result.current.queueExternalLink('https://www.nasa.gov/missions')
    })

    expect(result.current.pendingExternalLink?.hostname).toBe('nasa.gov')
  })

  it('queueExternalLink accepts a custom label', () => {
    const { result } = renderHook(() => useExternalLink('Default'))

    act(() => {
      result.current.queueExternalLink('https://example.com', 'Custom Label')
    })

    expect(result.current.pendingExternalLink?.label).toBe('Custom Label')
  })

  it('queueExternalLink uses defaultLabel when none is provided', () => {
    const { result } = renderHook(() => useExternalLink('Open Link'))

    act(() => {
      result.current.queueExternalLink('https://example.com')
    })

    expect(result.current.pendingExternalLink?.label).toBe('Open Link')
  })

  it('confirmExternalLink opens window with correct arguments and clears state', () => {
    const { result } = renderHook(() => useExternalLink('Visit'))

    act(() => {
      result.current.queueExternalLink('https://example.com/page')
    })

    act(() => {
      result.current.confirmExternalLink()
    })

    expect(openMock).toHaveBeenCalledWith(
      'https://example.com/page',
      '_blank',
      'noopener,noreferrer',
    )
    expect(result.current.pendingExternalLink).toBeNull()
  })

  it('confirmExternalLink does nothing when no link is pending', () => {
    const { result } = renderHook(() => useExternalLink('Visit'))

    act(() => {
      result.current.confirmExternalLink()
    })

    expect(openMock).not.toHaveBeenCalled()
    expect(result.current.pendingExternalLink).toBeNull()
  })

  it('cancelExternalLink clears pending state', () => {
    const { result } = renderHook(() => useExternalLink('Visit'))

    act(() => {
      result.current.queueExternalLink('https://example.com')
    })

    expect(result.current.pendingExternalLink).not.toBeNull()

    act(() => {
      result.current.cancelExternalLink()
    })

    expect(result.current.pendingExternalLink).toBeNull()
  })

  it('preserves subdomain when hostname does not start with www', () => {
    const { result } = renderHook(() => useExternalLink('Visit'))

    act(() => {
      result.current.queueExternalLink('https://api.nasa.gov/endpoint')
    })

    expect(result.current.pendingExternalLink?.hostname).toBe('api.nasa.gov')
  })
})
