import { describe, expect, it } from 'vitest'
import { buildProxyUrlAtWidth, buildCardSrcSet } from './imageProxy'

describe('buildProxyUrlAtWidth', () => {
  it('appends width parameter to the URL', () => {
    const result = buildProxyUrlAtWidth(
      'http://localhost:3001/api/image-proxy?url=https%3A%2F%2Fexample.com%2Fimg.jpg',
      320,
    )

    expect(result).toContain('w=320')
  })

  it('overwrites an existing width parameter', () => {
    const result = buildProxyUrlAtWidth(
      'http://localhost:3001/api/image-proxy?url=https%3A%2F%2Fexample.com%2Fimg.jpg&w=100',
      480,
    )

    expect(result).toContain('w=480')
    expect(result).not.toContain('w=100')
  })

  it('preserves existing query parameters', () => {
    const result = buildProxyUrlAtWidth(
      'http://localhost:3001/api/image-proxy?url=https%3A%2F%2Fexample.com%2Fimg.jpg',
      320,
    )

    expect(result).toContain('url=https')
    expect(result).toContain('w=320')
  })

  it('returns the original string for an invalid URL', () => {
    const result = buildProxyUrlAtWidth('not-a-valid-url', 320)

    expect(result).toBe('not-a-valid-url')
  })

  it('returns the original string for an empty string', () => {
    const result = buildProxyUrlAtWidth('', 320)

    expect(result).toBe('')
  })
})

describe('buildCardSrcSet', () => {
  const proxyUrl = 'http://localhost:3001/api/image-proxy?url=https%3A%2F%2Fexample.com%2Fimg.jpg'

  it('generates a srcset string with 320w, 480w, and 640w entries', () => {
    const result = buildCardSrcSet(proxyUrl)

    expect(result).toContain('320w')
    expect(result).toContain('480w')
    expect(result).toContain('640w')
  })

  it('includes width parameters for 320 and 480 sizes', () => {
    const result = buildCardSrcSet(proxyUrl)
    const parts = result.split(', ')

    expect(parts).toHaveLength(3)
    expect(parts[0]).toContain('w=320')
    expect(parts[0]).toMatch(/ 320w$/)
    expect(parts[1]).toContain('w=480')
    expect(parts[1]).toMatch(/ 480w$/)
  })

  it('uses the original proxy URL without width param for the 640w entry', () => {
    const result = buildCardSrcSet(proxyUrl)
    const parts = result.split(', ')

    expect(parts[2]).toBe(`${proxyUrl} 640w`)
  })

  it('handles invalid URLs gracefully by returning them as-is in srcset', () => {
    const result = buildCardSrcSet('bad-url')

    expect(result).toContain('bad-url 320w')
    expect(result).toContain('bad-url 480w')
    expect(result).toContain('bad-url 640w')
  })
})
