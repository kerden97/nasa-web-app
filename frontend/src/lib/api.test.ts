import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { z } from 'zod'
import { ApiHttpError, fetchApi } from '@/lib/api'

describe('fetchApi', () => {
  const mockedFetch = vi.fn()

  beforeEach(() => {
    vi.stubGlobal('fetch', mockedFetch)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('maps network failures to a friendly public message', async () => {
    mockedFetch.mockRejectedValue(new TypeError('Failed to fetch'))

    await expect(fetchApi('/api/apod')).rejects.toMatchObject<ApiHttpError>({
      message: "We couldn't reach NASA right now. Check your connection and try again.",
      status: 0,
      code: 'network_error',
    })
  })

  it('keeps server-provided error messages when available', async () => {
    mockedFetch.mockResolvedValue(
      new Response(
        JSON.stringify({
          error: "NASA's API is temporarily unavailable. Please try again shortly.",
          code: 'upstream_service_unavailable',
          status: 502,
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    )

    await expect(fetchApi('/api/apod')).rejects.toMatchObject<ApiHttpError>({
      message: "NASA's API is temporarily unavailable. Please try again shortly.",
      status: 502,
      code: 'upstream_service_unavailable',
    })
  })

  it('maps generic server failures when the response body has no error message', async () => {
    mockedFetch.mockResolvedValue(
      new Response(JSON.stringify({}), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(fetchApi('/api/apod')).rejects.toMatchObject<ApiHttpError>({
      message: 'NASA data is temporarily unavailable. Please try again in a moment.',
      status: 503,
    })
  })

  it('maps generic client failures when the response body has no error message', async () => {
    mockedFetch.mockResolvedValue(
      new Response(JSON.stringify({}), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(fetchApi('/api/apod')).rejects.toMatchObject<ApiHttpError>({
      message: "This request couldn't be completed. Please adjust your filters and try again.",
      status: 400,
    })
  })

  it('rethrows abort errors unchanged', async () => {
    mockedFetch.mockRejectedValue(new DOMException('The operation was aborted.', 'AbortError'))

    await expect(fetchApi('/api/apod')).rejects.toMatchObject({ name: 'AbortError' })
  })

  it('rejects JSON responses that fail the provided runtime schema', async () => {
    mockedFetch.mockResolvedValue(
      new Response(JSON.stringify({ items: 'invalid' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await expect(
      fetchApi(
        '/api/apod',
        undefined,
        undefined,
        z.object({
          items: z.array(z.string()),
        }),
      ),
    ).rejects.toMatchObject<ApiHttpError>({
      message: 'Something went wrong while loading this section.',
      status: 200,
      code: 'invalid_json_response',
    })
  })
})
