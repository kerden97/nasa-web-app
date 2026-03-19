import { z } from 'zod'
import { apiErrorBodySchema } from '@/schemas/api'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

const NETWORK_ERROR_MESSAGE =
  "We couldn't reach NASA right now. Check your connection and try again."
const SERVER_ERROR_MESSAGE = 'NASA data is temporarily unavailable. Please try again in a moment.'
const CLIENT_ERROR_MESSAGE =
  "This request couldn't be completed. Please adjust your filters and try again."
const UNKNOWN_ERROR_MESSAGE = 'Something went wrong while loading this section.'

type ApiErrorBody = z.infer<typeof apiErrorBodySchema>

export class ApiHttpError extends Error {
  status: number
  code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiHttpError'
    this.status = status
    this.code = code
  }
}

function isAbortError(error: unknown): error is DOMException {
  return error instanceof DOMException && error.name === 'AbortError'
}

function getResponseError(response: Response, body: ApiErrorBody | null): ApiHttpError {
  const message =
    typeof body?.error === 'string' && body.error.trim()
      ? body.error.trim()
      : response.status >= 500
        ? SERVER_ERROR_MESSAGE
        : response.status >= 400
          ? CLIENT_ERROR_MESSAGE
          : UNKNOWN_ERROR_MESSAGE

  const code = typeof body?.code === 'string' ? body.code : undefined
  const status = typeof body?.status === 'number' ? body.status : response.status
  return new ApiHttpError(message, status, code)
}

function parseApiErrorBody(body: unknown): ApiErrorBody | null {
  const parsed = apiErrorBodySchema.safeParse(body)
  return parsed.success ? parsed.data : null
}

function getNetworkError(error: unknown): ApiHttpError {
  if (error instanceof TypeError) {
    return new ApiHttpError(NETWORK_ERROR_MESSAGE, 0, 'network_error')
  }

  return new ApiHttpError(UNKNOWN_ERROR_MESSAGE, 0, 'unknown_error')
}

export async function fetchApi<T>(
  path: string,
  params?: Record<string, string>,
  signal?: AbortSignal,
  schema?: z.ZodType<T>,
): Promise<T> {
  const url = new URL(path, API_URL)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value)
    })
  }

  let response: Response

  try {
    response = await fetch(url.toString(), { signal })
  } catch (error) {
    if (isAbortError(error)) throw error
    throw getNetworkError(error)
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw getResponseError(response, parseApiErrorBody(body))
  }

  const body = await response.json().catch(() => {
    throw new ApiHttpError(UNKNOWN_ERROR_MESSAGE, response.status, 'invalid_json_response')
  })

  if (!schema) {
    return body as T
  }

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    throw new ApiHttpError(UNKNOWN_ERROR_MESSAGE, response.status, 'invalid_json_response')
  }

  return parsed.data
}
