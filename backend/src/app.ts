import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import compression from 'compression'
import { config } from './config'
import { sendApiError } from './lib/apiErrors'
import { requestLogger } from './middleware/requestLogger'
import { globalErrorHandler } from './middleware/errorHandler'
import healthRoutes from './routes/health'
import apodRoutes from './routes/apod'
import nasaImageRoutes from './routes/nasaImage'
import epicRoutes from './routes/epic'
import neowsRoutes from './routes/neows'

export function createApp() {
  const app = express()

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  )
  app.use(cors({ origin: config.frontendOrigins }))
  app.use(compression())
  app.use(express.json())
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
