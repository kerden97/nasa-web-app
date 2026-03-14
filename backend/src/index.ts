import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import compression from 'compression'
import { config } from './config'
import logger from './lib/logger'
import { requestLogger } from './middleware/requestLogger'
import { globalErrorHandler } from './middleware/errorHandler'
import healthRoutes from './routes/health'
import apodRoutes from './routes/apod'
import nasaImageRoutes from './routes/nasaImage'
import epicRoutes from './routes/epic'
import { prefetchLatest } from './services/apod'

const app = express()

app.use(helmet())
app.use(cors({ origin: config.frontendOrigins }))
app.use(compression())
app.use(express.json())
app.use(requestLogger)

app.use(healthRoutes)
app.use(apodRoutes)
app.use(nasaImageRoutes)
app.use(epicRoutes)

app.use(globalErrorHandler)

app.listen(config.port, '0.0.0.0', () => {
  logger.info(`Backend listening on http://0.0.0.0:${config.port}`)
  prefetchLatest()
})

export default app
