import app from './app'
import { config } from './config'
import logger from './lib/logger'
import { prefetchLatest } from './services/apod'

export function startServer() {
  return app.listen(config.port, '0.0.0.0', () => {
    logger.info(`Backend listening on http://0.0.0.0:${config.port}`)
    prefetchLatest()
  })
}

if (require.main === module) {
  startServer()
}
