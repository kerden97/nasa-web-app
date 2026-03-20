import dotenv from 'dotenv'

dotenv.config({
  quiet: process.env.JEST_WORKER_ID !== undefined,
})

const localFrontendOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
]

function getFrontendOrigins(): string[] {
  const configuredOrigins = process.env.FRONTEND_ORIGIN?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

  return configuredOrigins?.length ? configuredOrigins : localFrontendOrigins
}

export const config = {
  port: Number(process.env.PORT || 4000),
  frontendOrigins: getFrontendOrigins(),
  nasa: {
    apiKey: process.env.NASA_API_KEY || 'DEMO_KEY',
    baseUrl: process.env.NASA_API_BASE_URL || 'https://api.nasa.gov',
  },
  redis: {
    url: process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
    enabled:
      process.env.ENABLE_REDIS_CACHE?.toLowerCase() === 'true' ||
      (process.env.ENABLE_REDIS_CACHE?.toLowerCase() !== 'false' &&
        process.env.NODE_ENV === 'production' &&
        !!process.env.UPSTASH_REDIS_REST_URL &&
        !!process.env.UPSTASH_REDIS_REST_TOKEN),
  },
  ai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  },
}
