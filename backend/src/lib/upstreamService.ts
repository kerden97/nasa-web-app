import logger from './logger'

const MAX_RETRIES = 3
const RETRY_STATUSES = new Set([429, 500, 502, 503, 504])

type UpstreamErrorKind = 'http' | 'network'

interface UpstreamServiceErrorOptions {
  kind?: UpstreamErrorKind
  status?: number
}

interface FetchUpstreamJsonOptions {
  serviceName: string
  requestLog: string
  transientRetryLog: string
  networkRetryLog: string
  errorLog: string
  context?: Record<string, unknown>
}

export class UpstreamServiceError extends Error {
  readonly serviceName: string
  readonly kind: UpstreamErrorKind
  readonly status: number | undefined

  constructor(
    serviceName: string,
    message: string,
    { kind = 'network', status }: UpstreamServiceErrorOptions = {},
  ) {
    super(message)
    this.name = 'UpstreamServiceError'
    this.serviceName = serviceName
    this.kind = kind
    this.status = status
  }
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function hasLegacyUpstreamMessage(error: Error, serviceName?: string): boolean {
  if (!serviceName) {
    return /(NASA API|NASA Image Library|NASA EPIC|NASA NeoWs)/.test(error.message)
  }

  return error.message.includes(serviceName)
}

export function isUpstreamServiceError(
  error: unknown,
  serviceName?: string,
): error is UpstreamServiceError {
  if (error instanceof UpstreamServiceError) {
    return serviceName ? error.serviceName.includes(serviceName) : true
  }

  return error instanceof Error && hasLegacyUpstreamMessage(error, serviceName)
}

export async function fetchUpstreamJson<T>(
  url: string,
  {
    serviceName,
    requestLog,
    transientRetryLog,
    networkRetryLog,
    errorLog,
    context = {},
  }: FetchUpstreamJsonOptions,
): Promise<T> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    logger.info(requestLog, { ...context, attempt })

    let response: Response
    try {
      response = await fetch(url)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown fetch error'

      if (attempt < MAX_RETRIES) {
        const delay = attempt * 1000
        logger.warn(networkRetryLog, {
          ...context,
          attempt,
          retryIn: `${delay}ms`,
          message,
        })
        await wait(delay)
        continue
      }

      logger.error(errorLog, {
        ...context,
        attempt,
        message,
      })
      throw new UpstreamServiceError(serviceName, `${serviceName} request failed: ${message}`, {
        kind: 'network',
      })
    }

    if (!response.ok) {
      const body = await response.text()

      if (RETRY_STATUSES.has(response.status) && attempt < MAX_RETRIES) {
        const retryAfter = response.headers?.get('retry-after')
        const retryAfterMs = retryAfter ? Math.min(Number(retryAfter) * 1000, 5000) : 0
        const delay = Math.max(retryAfterMs, attempt * 1000)
        logger.warn(transientRetryLog, {
          ...context,
          status: response.status,
          attempt,
          retryIn: `${delay}ms`,
        })
        await wait(delay)
        continue
      }

      logger.error(errorLog, {
        ...context,
        status: response.status,
        body,
      })
      throw new UpstreamServiceError(
        serviceName,
        `${serviceName} responded with ${response.status}`,
        {
          kind: 'http',
          status: response.status,
        },
      )
    }

    return (await response.json()) as T
  }

  throw new UpstreamServiceError(serviceName, `${serviceName} failed after retries`, {
    kind: 'network',
  })
}
