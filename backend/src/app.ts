import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import { config } from './config'
import { sendApiError } from './lib/apiErrors'
import { requestLogger } from './middleware/requestLogger'
import { globalErrorHandler } from './middleware/errorHandler'
import healthRoutes from './routes/health'
import apodRoutes from './routes/apod'
import nasaImageRoutes from './routes/nasaImage'
import epicRoutes from './routes/epic'
import neowsRoutes from './routes/neows'

const apiLimiter = rateLimit({
  windowMs: 60_000,
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please try again shortly.',
    code: 'rate_limit_exceeded',
    status: 429,
  },
})

export function createApp() {
  const app = express()

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: [
            "'self'",
            'data:',
            'https://apod.nasa.gov',
            'https://epic.gsfc.nasa.gov',
            'https://images-assets.nasa.gov',
          ],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          frameSrc: ["'self'", 'https://www.youtube.com', 'https://player.vimeo.com'],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
        },
      },
      strictTransportSecurity: {
        maxAge: 63_072_000,
        includeSubDomains: true,
        preload: true,
      },
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    }),
  )
  app.use(cors({ origin: config.frontendOrigins }))
  app.use(compression())
  app.use(express.json())
  app.use('/api', apiLimiter)
  app.use(requestLogger)

  app.use(healthRoutes)
  app.use(apodRoutes)
  app.use(nasaImageRoutes)
  app.use(epicRoutes)
  app.use(neowsRoutes)

  app.use((_req, res) => {
    sendApiError(res, 404, 'route_not_found', 'Route not found')
  })

  app.use(globalErrorHandler)

  return app
}

const app = createApp()

export default app
