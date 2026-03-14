import dotenv from 'dotenv'

dotenv.config({
  quiet: process.env.JEST_WORKER_ID !== undefined,
})

export const config = {
  port: Number(process.env.PORT || 4000),
  frontendOrigins: (process.env.FRONTEND_ORIGIN || 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim()),
  nasa: {
    apiKey: process.env.NASA_API_KEY || 'DEMO_KEY',
    baseUrl: process.env.NASA_API_BASE_URL || 'https://api.nasa.gov',
  },
}
